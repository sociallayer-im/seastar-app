'use client'

import {ReactNode} from 'react'
import copy from "copy-to-clipboard"
import {useToast} from "@/components/shadcn/Toast/use-toast"

export default function CopyText(props: {value?: string | null, className?: string, children: ReactNode}) {
    const {toast} = useToast()

    const handleCopy = () => {
        if (!!props.value) {
            copy(props.value)
            toast({title: 'Copied !', variant: 'success'})
        }
    }

    return <div className={props.className} onClick={handleCopy}>
        {props.children}
    </div>
}
