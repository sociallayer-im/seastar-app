'use client'

import QrCode from "@/components/client/QRcode"
import {useEffect, useState} from 'react'

export default function InviteQrcode() {
    const [link, setlink] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
          setlink(window.location.origin)
        }
    }, [])

    return <QrCode size={[160, 160]} text={link}/>
}