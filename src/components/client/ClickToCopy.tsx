'use client'

import {useToast} from '@/components/shadcn/Toast/use-toast'
import {ReactNode} from 'react'

export default function ClickToCopy(props: { text: string, children: ReactNode, className?: string }) {
    const {toast} = useToast()

    const copyText = () => {
        navigator.clipboard.writeText(props.text)
        toast({
            title: 'Link Copied'
        })
    }

    return <span className={props.className} onClick={copyText}>{props.children}</span>
}