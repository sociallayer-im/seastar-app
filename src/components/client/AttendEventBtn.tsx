'use client'

import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {attendEventWithoutTicket} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'

export default function AttendEventBtn({eventId, lang, className, onAttended}: {
    eventId: number,
    lang: Dictionary,
    className?: string
    onAttended?:() => void
}) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()
    const handleAttendEvent = async () => {
        const loading = showLoading()
        try {

            // for test
            // throw new Error('group membership required for Edge Esmeralda')

            const authToken = getAuth()
            await attendEventWithoutTicket({
                params: {
                    eventId: eventId,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({
                title: 'Attended event',
                variant: 'success'
            })
            if (onAttended) {
                onAttended()
            } else {
                window.setTimeout(() => window.location.reload(), 2000)
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


    return <Button variant={'special'}
                   onClick={handleAttendEvent}
                   className={className}>
        <span>{lang['Join Event(RSVP)']}</span>
    </Button>
}

