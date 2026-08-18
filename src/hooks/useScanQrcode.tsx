import useModal from '@/components/client/Modal/useModal'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useToast} from '@/components/shadcn/Toast/use-toast'

interface ScanQrcodeProps {
    onResult?: (res: string) => any
    close: () => void
}

export default function useScanQrcode() {
    const {openModal} = useModal()

    const scanQrcode = async (onResult?: (res: string) => void) => {
        openModal({
            clickOutsideToClose: false,
            content: (close: any) => <DialogScanQrcode
                close={close!}
                onResult={(r) => {
                    onResult?.(r)
                }}/>,
        })
    }

    return {scanQrcode}
}

// Decoding a full-resolution frame in JS is needlessly slow; QR modules stay
// resolvable well below the camera's native size.
const DECODE_MAX_SIDE = 640
// ~10 fps. Faster gains nothing — a user holding a phone at a code needs a few
// hundred ms anyway — and it keeps the main thread free on older iPhones.
const DECODE_INTERVAL_MS = 100

type NativeDetector = {detect: (source: CanvasImageSource) => Promise<Array<{rawValue: string}>>}

/**
 * Chrome/Android has a native detector that is much faster than anything we can
 * do in JS. Safari — and therefore every browser on iOS — does not implement it
 * (it was briefly available behind a flag on iOS 17 and regressed in 18), which
 * is exactly why the JS decoder below is a hard requirement and not a nicety:
 * event check-in happens on phones, and a large share of them are iPhones.
 */
const createNativeDetector = async (): Promise<NativeDetector | null> => {
    const ctor = (globalThis as unknown as {
        BarcodeDetector?: {
            new(opts: {formats: string[]}): NativeDetector
            getSupportedFormats?: () => Promise<string[]>
        }
    }).BarcodeDetector

    if (!ctor) return null

    try {
        // Presence of the constructor does not guarantee the format is
        // supported by the platform's backend.
        const formats = await ctor.getSupportedFormats?.()
        if (formats && !formats.includes('qr_code')) return null
        return new ctor({formats: ['qr_code']})
    } catch {
        return null
    }
}

function DialogScanQrcode(props: ScanQrcodeProps) {
    const {toast} = useToast()
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const closedRef = useRef(false)
    const [status, setStatus] = useState<'starting' | 'scanning' | 'failed'>('starting')

    // Every exit path runs through here: the camera must be released, or the
    // indicator light stays on and the device keeps the capture session open.
    const teardown = useCallback(() => {
        closedRef.current = true
        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null
    }, [])

    const handleClose = useCallback(() => {
        teardown()
        props.close()
    }, [teardown, props])

    useEffect(() => {
        // Reset on entry, not just at mount: a double-invoked effect (React
        // StrictMode) would otherwise start with the flag its own cleanup set,
        // release the stream immediately and sit on "Starting camera..."
        // forever. vinext does not wrap the App Router in StrictMode today,
        // which is the only reason this is latent rather than broken.
        closedRef.current = false

        let frameHandle = 0
        let timer: ReturnType<typeof setTimeout> | undefined
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', {willReadFrequently: true})

        const fail = (description: string) => {
            if (closedRef.current) return
            setStatus('failed')
            toast({description, variant: 'warning'})
        }

        ;(async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                fail('Camera is not available in this browser')
                return
            }

            let stream: MediaStream
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    // The rear camera is the one pointed at someone else's phone.
                    video: {facingMode: {ideal: 'environment'}}
                })
            } catch (e: unknown) {
                console.error(e)
                fail('No camera found or permission denied')
                return
            }

            // Closed while the permission prompt was up: release immediately,
            // otherwise this stream leaks with no one left to stop it.
            if (closedRef.current) {
                stream.getTracks().forEach(track => track.stop())
                return
            }

            streamRef.current = stream
            const video = videoRef.current
            if (!video) {
                stream.getTracks().forEach(track => track.stop())
                return
            }

            video.srcObject = stream
            // Required for iOS Safari to play inline instead of going fullscreen.
            video.setAttribute('playsinline', 'true')
            try {
                await video.play()
            } catch (e: unknown) {
                console.error(e)
                fail('Could not start the camera preview')
                return
            }

            if (closedRef.current) return
            setStatus('scanning')

            let detector = await createNativeDetector()
            let decodeQR: ((data: Uint8ClampedArray, w: number, h: number) => string | null) | null =
                detector ? null : (await import('@/utils/qrcode')).decodeQR

            const loadFallbackDecoder = async () => {
                if (!decodeQR) decodeQR = (await import('@/utils/qrcode')).decodeQR
                detector = null
            }

            const handleResult = (value: string) => {
                if (closedRef.current || !value) return
                props.onResult?.(value)
                handleClose()
            }

            // A detector can exist, advertise qr_code, and still reject every
            // call (Chrome's Shape Detection service unavailable, some Android
            // WebViews). Without this the UI scans forever, resolving nothing
            // and logging ~10 errors a second, because the JS decoder was never
            // even imported.
            let detectFailures = 0
            const DETECT_FAILURES_BEFORE_FALLBACK = 3

            const scanFrame = async () => {
                if (closedRef.current) return

                const width = video.videoWidth
                const height = video.videoHeight
                if (!width || !height) return

                if (detector) {
                    try {
                        const results = await detector.detect(video)
                        detectFailures = 0
                        if (results[0]?.rawValue) {
                            handleResult(results[0].rawValue)
                        }
                    } catch (e: unknown) {
                        detectFailures++
                        if (detectFailures >= DETECT_FAILURES_BEFORE_FALLBACK) {
                            console.error('[qrcode] native detector unusable, falling back', e)
                            await loadFallbackDecoder()
                        }
                    }
                    return
                }

                if (!ctx || !decodeQR) return

                const scale = Math.min(1, DECODE_MAX_SIDE / Math.max(width, height))
                canvas.width = Math.round(width * scale)
                canvas.height = Math.round(height * scale)
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height)

                const value = decodeQR(data, canvas.width, canvas.height)
                if (value) handleResult(value)
            }

            const loop = async () => {
                if (closedRef.current) return
                await scanFrame()
                if (closedRef.current) return
                timer = setTimeout(() => {
                    frameHandle = requestAnimationFrame(loop)
                }, DECODE_INTERVAL_MS)
            }

            await loop()
        })()

        return () => {
            teardown()
            clearTimeout(timer)
            cancelAnimationFrame(frameHandle)
        }
        // Deliberately mount-only: re-running would restart the camera.
    }, [])

    return <div className="bg-black p-3 shadow flex flex-col items-center justify-center relative overflow-hidden"
                style={{width: '100vw', height: '100svh'}}>

        <img src="/images/scan.png" alt="" className="scan-line z-10"/>

        <div className="relative w-full max-w-[476px] aspect-square overflow-hidden rounded-lg">
            <video ref={videoRef}
                   className="w-full h-full object-cover"
                   muted
                   playsInline
                   autoPlay/>
            {status !== 'scanning' &&
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    {status === 'starting' ? 'Starting camera...' : 'Camera unavailable'}
                </div>
            }
        </div>

        <i onClick={handleClose}
           className="uil-times-circle text-white text-4xl mt-3 cursor-pointer"/>
    </div>
}
