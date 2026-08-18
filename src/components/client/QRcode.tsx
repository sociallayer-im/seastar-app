'use client'

import {useEffect, useState, CSSProperties} from 'react'
import {encodeQR} from '@/utils/qrcode/encode'

interface QRcodeProps {
    text: string
    size: number[]
    style?: CSSProperties,
    className?: string
}

/**
 * Colours, matching what the `qrcode` package actually produced here.
 *
 * The old call passed `light: 'red'`, but that string is not a hex colour and
 * the library's parser turned it into rgba(0, 0, 0, 0) rather than rejecting
 * it — so the light modules have always been *transparent*, never red. Keeping
 * them transparent is what preserves the rendered appearance.
 */
const DARK = [0, 0, 0, 255]
const LIGHT = [0, 0, 0, 0]

/**
 * Draw the module matrix into a PNG data URL, `width` pixels square, with no
 * quiet zone. Modules are laid down as raw pixels (nearest neighbour, exactly
 * as the previous library did) rather than scaled by the canvas, so edges stay
 * crisp at any size.
 */
function toDataUrl(text: string, width: number): string {
    const matrix = encodeQR(text, {errorCorrectionLevel: 'L'})
    const modules = matrix.width

    const scale = width >= modules ? width / modules : 4
    const pixels = Math.floor(modules * scale)

    const canvas = document.createElement('canvas')
    canvas.width = pixels
    canvas.height = pixels

    const context = canvas.getContext('2d')
    if (context === null) throw new Error('canvas 2d context unavailable')
    context.imageSmoothingEnabled = false

    const image = context.createImageData(pixels, pixels)
    for (let y = 0; y < pixels; y++) {
        const sourceY = Math.floor(y / scale)
        for (let x = 0; x < pixels; x++) {
            const sourceX = Math.floor(x / scale)
            const colour = matrix.data[sourceY * modules + sourceX] ? DARK : LIGHT
            const offset = (y * pixels + x) * 4
            image.data[offset] = colour[0]
            image.data[offset + 1] = colour[1]
            image.data[offset + 2] = colour[2]
            image.data[offset + 3] = colour[3]
        }
    }
    context.putImageData(image, 0, 0)

    return canvas.toDataURL()
}

function QrCode(props: QRcodeProps) {
    const [dataUrl, setDataUrl] = useState('')

    useEffect(() => {
        if (! props.text) return

        try {
            setDataUrl(toDataUrl(props.text, props.size[0]))
        } catch (error: unknown) {
            console.error(error)
            if (error) console.error('[app-qrcode]:' + JSON.stringify(error))
        }
    }, [props.text])

    return (
        <>
            {dataUrl && <img className={props.className || ''} src={dataUrl}
                style={{width: `${props.size[0]}px`, height: `${props.size[1]}px`, ...props.style}}
                alt=''/>}
        </>
    )
}

export default QrCode
