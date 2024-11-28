import {useEffect, useState, CSSProperties} from 'react'
import QRCode from 'qrcode'

interface QRcodeProps {
    text: string
    size: number[]
    style?: CSSProperties,
    className?: string
}

function QrCode(props: QRcodeProps) {
    const [dataUrl, setDataUrl] = useState('')

    useEffect(() => {
        QRCode.toDataURL(
            props.text,
            {
                width: props.size[0],
                margin: 0,
                color: {
                    light: 'red',
                    dark: '#000'
                }
            },
            (error: unknown, url: string) => {
                if (error) console.error('[app-qrcode]:' + JSON.stringify(error))
                setDataUrl(url)
            })
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
