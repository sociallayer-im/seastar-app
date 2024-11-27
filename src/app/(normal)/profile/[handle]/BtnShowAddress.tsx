'use client'

import useModal from "@/components/client/Modal/useModal"
import {Button} from "@/components/shadcn/Button"
import copy from 'copy-to-clipboard'
import {useToast} from "@/components/shadcn/Toast/use-toast"
import {ReactNode} from "react"

export default function BtnShowAddress(props: {address: string, label?: {title?: string, close?: string, copy?:string}, children: ReactNode}) {
    const {openModal} = useModal()
    const {toast} = useToast()

    const handleShowAddress = () => {
        openModal({
            content: (close) => <div className="w-[360px] shadow p-4 rounded-lg bg-white">
                <div className="font-semibold text-lg">{props.label?.title || 'Address'}</div>
                <div className="break-all my-4">{props.address}</div>
                <div className="flex flex-row-item-center">
                    <Button className="flex-1 mr-2"  variant={'secondary'} onClick={close}>
                        {props.label?.close || 'Close'}
                    </Button>
                    <Button className="flex-1" variant={'primary'}
                        onClick={() => {
                            copy(props.address)
                            toast({title: 'Copied !', variant: 'default'})
                        }}>{props.label?.copy || 'Copy'}</Button>
                </div>
            </div>
        })
    }

    return <div onClick={handleShowAddress}>
        {props.children}
    </div>
}
