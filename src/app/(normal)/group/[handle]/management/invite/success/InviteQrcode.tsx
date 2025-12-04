'use client'

import QrCode from "@/components/client/QRcode"
import {useEffect, useState} from 'react'

export default function InviteQrcode(props: {id: string}) {
    const [link, setlink] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
          setlink(`${window.location.origin}/invite/${props.id}`)
        }
    }, [])

    return <QrCode size={[160, 160]} text={link}/>
}