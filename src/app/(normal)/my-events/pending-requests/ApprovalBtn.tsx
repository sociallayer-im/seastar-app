'use client'

import {Button, ButtonProps} from '@/components/shadcn/Button'
import {approveEvent} from '@sola/sdk'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {Dictionary} from '@/lang'

export default function ApprovalBtn({children, eventId, langPkg, ...props}: ButtonProps & { eventId: number, langPkg: Dictionary }) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const handleClick = async () => {
        showConfirmDialog({
            lang: langPkg,
            type: 'info',
            title: langPkg['Approve Event'],
            content: langPkg['Are you sure to approve this event ?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    await approveEvent({
                        params: {
                            eventId: eventId,
                            authToken: getAuth()!
                        },
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: 'Approve success',
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        description: (e as Error).message || 'Approve fail !',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    return <Button onClick={(e) => {
        e.preventDefault()
        handleClick()
    }} {...props}>
        {children}
    </Button>
}