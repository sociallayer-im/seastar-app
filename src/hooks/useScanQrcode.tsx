import useModal from '@/components/client/Modal/useModal'
import {useEffect, useRef} from 'react'
// Type-only imports — the html5-qrcode implementation (370 KB, the largest
// client chunk) is loaded on demand inside the dialog effect, not at page load.
import type {Html5Qrcode} from 'html5-qrcode'
import type {Html5QrcodeResult} from 'html5-qrcode/src/core'
import type {CameraDevice} from 'html5-qrcode/src/camera/core'
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

function DialogScanQrcode(props: ScanQrcodeProps) {
    const {toast} = useToast()
    const html5QrcodeRef = useRef<Html5Qrcode | undefined>(undefined)

    const handleClose = () => {
        html5QrcodeRef.current?.stop()
        props.close()
    }

    useEffect(() => {
        ;(async () => {
            const {Html5Qrcode} = await import('html5-qrcode')
            html5QrcodeRef.current = new Html5Qrcode('reader')

            let cameras: Array<CameraDevice> = []

            try {
                cameras = await Html5Qrcode.getCameras()
            } catch (e: unknown) {
                console.error(e)
                toast({
                    description: 'No camera found or permission denied',
                    variant: 'warning'
                })
                return
            }

            if (!cameras || cameras.length === 0) {
                toast({
                    description: 'No camera found or permission denied',
                    variant: 'warning'
                })
                return
            }

            function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
                props.onResult?.(decodedText)
                handleClose()
            }

            function onScanFailure(error: string) {
            }

            try {
                await html5QrcodeRef.current.start(cameras[0].id, {
                    fps: 10,
                }, onScanSuccess, onScanFailure)
            } catch (e: unknown) {
                console.error(e)
                toast({
                    description: e instanceof Error ? e.message : 'Scan failed',
                    variant: 'warning'
                })
                return
            }

            return async () => {
                await html5QrcodeRef.current?.stop()
            }
        })()
    }, [])

    const style = {width: '100vw', height: '100vh'}

    return <div className="bg-black p-3 shadow flex flex-col items-center justify-center relative overflow-hidden"
                style={style}>

        <img src="/images/scan.png" alt="" className="scan-line z-10" />
        <div id="reader"
             style={{width: '100%', maxWidth: '476px'}}/>

        <i onClick={handleClose}
           className="uil-times-circle text-white text-4xl mt-3 cursor-possinter"/>
    </div>
}
