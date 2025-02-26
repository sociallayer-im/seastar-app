'use client'

import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {attendEventWithoutTicket} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export default function AttendEventBtn({eventId, lang, className}: {
    eventId: number,
    lang: Dictionary,
    className?: string
}) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleAttendEvent = async () => {
        const loading = showLoading()
        try {
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

            window.setTimeout(() => window.location.reload(), 3000)
        } catch (e: unknown) {
            console.error('[handleAttendEvent]: ', e)
            toast({
                title: e instanceof Error ? e.message : 'Failed to attend event',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }


    return <Button variant={'special'}
                   onClick={handleAttendEvent}
                   className={className}>
        <span>{lang['Join Event']}</span>
    </Button>
}

