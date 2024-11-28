import {useState, useEffect, useRef} from 'react'
import Cropper, { ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import {Button} from "@/components/shadcn/Button"
import {Slider} from "@/components/shadcn/Slider"

export interface DialogCropperProps {
    imgURL: string
    close?: () => void
    onConfirm: (res: Blob) => void
}

function DialogCropper(props: DialogCropperProps) {
    const cropperRef = useRef<ReactCropperElement>(null)
    const [scale, setScale] = useState([0])
    const [minScale, setMinScale] = useState(0)
    const [maxScale, setMaxScale] = useState(0.001)
    const cropBoxInitSize = 216
    const resetTimeout = useRef<number | null>(null)

    const setPosition = () => {
        const cropper = cropperRef.current?.cropper
        const img = new Image()
        img.src = props.imgURL
        img.onload = () => {
            cropper!.zoomTo(0)
            // 限制缩放比例
            const reference = Math.min(img.width, img.height)
            const calcMinScale = cropBoxInitSize / reference
            const calcMaxScale = cropBoxInitSize * 3/ reference

            setMaxScale(calcMaxScale)
            setMinScale(calcMinScale)
            setScale([calcMinScale])

            setTimeout(() => {
                cropper!.zoomTo(calcMinScale)
            }, 100)
        }
    }

    const regression = () => {
        const cropper = cropperRef.current?.cropper
        !!resetTimeout.current && clearTimeout(resetTimeout.current)
        resetTimeout.current = window.setTimeout(() => {
            const imageInfo = cropper!.getImageData()
            const imageInfo2 = cropper!.getCanvasData()
            let offsetX = imageInfo2.left
            let offsetY = imageInfo2.top
            if (imageInfo2.left >= 48) {
                offsetX = 48
                console.log(1, 48)
            } else if (imageInfo2.left + imageInfo.width - 48 < cropBoxInitSize) {
                offsetX = (imageInfo.width - cropBoxInitSize) * -1 + 48
                console.log(2, offsetX)
            }

            if (imageInfo2.top > 0) {
                offsetY = 0
                console.log(11, offsetY)
            } else if (imageInfo2.top + imageInfo.height < cropBoxInitSize) {
                offsetY = (imageInfo.height - cropBoxInitSize) * -1
                console.log(22, offsetY)
            }

            if (offsetX !== imageInfo2.left || offsetY !== imageInfo2.top) {
                cropper?.setCanvasData({
                    left: offsetX,
                    top: offsetY
                })
            }
        }, 100)
    }

    const compress = (data: Blob):Promise<Blob | null> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = URL.createObjectURL(data)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.save()
                    canvas.width = 600
                    canvas.height = 600
                    ctx.drawImage(img, 0, 0, 600, 600)
                    ctx.restore()
                    canvas.toBlob(
                        blob => {
                            resolve(blob)
                        },
                        'image/png',
                        1
                    )
                }
            }
        })
    }

    const confirm =  () => {
        const cropper = cropperRef.current?.cropper
        cropper!.getCroppedCanvas().toBlob(async (blob) => {
            if (blob) {
                const data = await compress(blob)
                props.onConfirm(data!)
            }
        })
    }

    useEffect(() => {
        if (scale) {
            setTimeout(()=> {
                const cropper = cropperRef.current?.cropper
                cropper && cropper!.zoomTo(scale[0])
                setTimeout(() => {
                    regression()
                }, 500)
            }, 100)
        }
    }, [scale])

    return (<div className='w-[300] h-[300] shadow bg-background rounded-lg p-4'>
        <div className='font-semibold mb-3'>
            {'Edit Image'}
        </div>
        <Cropper
            src={ props.imgURL }
            style={{ height: "216px", width: "311px", marginBottom: '12px' }}
            aspectRatio={1}
            guides={false}
            ref={cropperRef}
            autoCrop={true}
            autoCropArea={1}
            cropBoxResizable={false}
            cropBoxMovable={false}
            scalable={false}
            zoomOnTouch={false}
            zoomOnWheel={false}
            dragMode={'move'}
            minCropBoxHeight={cropBoxInitSize}
            minCropBoxWidth={cropBoxInitSize}
            viewMode={0}
            ready={() => {
                setPosition()
            }}
            cropend={() => {
                regression()
            }}
        />

        <div className="py-3 flex-row-item-center">
            <i className="uil-image text-sm mr-2"/>
            <Slider
                step={ (maxScale - minScale) / 20 }
                value={scale}
                min={minScale}
                max={maxScale}
                onValueChange={setScale}
            />
            <i className="uil-image text-xl ml-2"/>
        </div>

        <div className='flex-row-item-center'>
            <Button className="flex-1 mr-2" variant={'secondary'} onClick={() => { props.close && props.close() }}>
                Cancel
            </Button>
            <Button className="flex-1" variant={'primary'} onClick={() => { confirm() }}>
                Confirm
            </Button>
        </div>
    </div>)
}

export default DialogCropper
