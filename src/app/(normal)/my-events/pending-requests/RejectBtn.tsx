'use client'

import {Button, ButtonProps} from '@/components/shadcn/Button'
import {useState} from 'react'
import {cancelEvent} from '@sola/sdk'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {Dictionary} from '@/lang'

export default function RejectBtn({children, eventId, langPkg, ...props}: ButtonProps & {
    eventId: number,
    langPkg: Dictionary
}) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const handleClick = async () => {
        showConfirmDialog({
            lang: langPkg,
            type: 'danger',
            title: langPkg['Reject Event'],
            content: langPkg['Are you sure you want to reject this event?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    await cancelEvent({
                        params: {
                            eventId: eventId,
                            authToken: getAuth()!
                        },
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: 'Rejection was successful',
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        description: (e as Error).message || 'Reject operation failed',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }

            }
        })
    }

    return <Button {...props}  onClick={e => {
        e.preventDefault()
        handleClick()
    }}>
        {children}
    </Button>
}