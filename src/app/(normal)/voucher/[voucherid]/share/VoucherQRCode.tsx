'use client'

import QrCode from "@/components/client/QRcode"
import {useEffect, useState} from 'react'

export default function VoucherQRCode(props: {voucherId: number, code?: string}) {
    const [voucherLink, setVoucherLink] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.pathname = `/voucher/${props.voucherId}`
            if (props.code) {
                url.searchParams.set('code', props.code)
            }
            setVoucherLink(url.toString())
        }
    }, [])

    return <QrCode  size={[160, 160]} text={voucherLink}/>
}