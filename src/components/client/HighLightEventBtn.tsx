'use client'

import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {EventDetail, EventDraftType, updateEvent} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import { useState } from 'react'

export default function HighLightEventBtn({event, lang, className, onHighlighted}: {
    event: EventDetail,
    lang: Dictionary,
    className?: string
    onHighlighted?:(highlighted: boolean) => void
}) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const [highlighted, setHighlighted] = useState(event.pinned)
    
    const handleHighlightEvent = async () => {
        const loading = showLoading()
        try {

            // for test
            // throw new Error('group membership required for Edge Esmeralda')

            const authToken = getAuth()
            await updateEvent({
                params: {
                    authToken: authToken!,
                    eventDraft: {
                        ...event,
                        pinned: !highlighted
                    } as EventDraftType
                },
                clientMode: CLIENT_MODE
            })
            toast({
                title: highlighted ? lang['Unhighlighted'] : lang['Highlighted'],
                variant: 'success'
            })
            setHighlighted(!highlighted)
            if (onHighlighted) {
                onHighlighted(!highlighted)
            }
        } catch (e: unknown) {
            console.error('[handleAttendEvent]: ', e)

            const message = e instanceof Error ? e.message : 'Failed to attend event'

            if (message.includes('group membership required for Edge Esmeralda')) {
                showConfirmDialog({
                    lang,
                    title: 'Join Event',
                    content: 'Please purchase the ticket to join the event. <br /><a style="color: #097eff; text-decoration: underline; white-space: nowrap;" href="https://citizen-portal-ten.vercel.app/auth" target="_blank">Go to Purchase Ticket</a>',
                    type: 'info'
                })
                return
            }
            
            toast({
                title: message,
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }


    return <Button variant={'secondary'}
                   onClick={handleHighlightEvent}
                   className={className}>
        <span>{highlighted ? lang['Unhighlighted'] : lang['Highlighted']}</span>
    </Button>
}

