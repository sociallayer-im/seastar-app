'use client'

import QrCode from "@/components/client/QRcode"
import {useEffect, useState} from 'react'

export default function InviteQrcode(props: {id: string, code?: string}) {
    const [link, setlink] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const base = `${window.location.origin}/invite/${props.id}`
            setlink(props.code ? `${base}?code=${props.code}` : base)
        }
    }, [])

    return <QrCode size={[160, 160]} text={link}/>
}