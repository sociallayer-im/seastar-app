'use client'

import useModal from '@/components/client/Modal/useModal'
import {Button} from '@/components/shadcn/Button'
import {useState} from 'react'
import {sendEventFeedback} from '@sola/sdk'
import {getAuth} from '@/utils'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Textarea} from '@/components/shadcn/Textarea'
import {Dictionary} from '@/lang'
import {CLIENT_MODE} from '@/app/config'

export default function EventFeedbackBtn({eventId, lang, className}: {
    eventId: number,
    lang: Dictionary,
    className?: string
}) {
    const {openModal} = useModal()

    const showFeedback = () => {
        openModal({
            content: (close) => <DialogFeedback
                close={close!}
                event_id={eventId}
                lang={lang}/>
        })
    }

    return <Button variant={'secondary'}
                   onClick={showFeedback}
                   className={className}>
        <span>{lang['Feedback']}</span>
    </Button>
}

function DialogFeedback({lang, ...props}: { close: () => void, event_id: number, lang: Dictionary }) {
    const [feedback, setFeedback] = useState<string>('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSendFeedback = async () => {
        const authToken = getAuth()

        const loading = showLoading()
        try {
            await sendEventFeedback({
                params: {
                    eventId: props.event_id,
                    feedback: feedback,
                    authToken: authToken!,
                },
                clientMode: CLIENT_MODE
            })
            toast({
                title: 'Feedback sent',
                variant: 'success'
            })
            props.close()
        } catch (e: unknown) {
            console.error('[handleSendFeedback]: ', e)
            toast({
                title: 'Failed to send feedback',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return (
        <div className="bg-background w-[350px] p-3 shadow rounded-lg">
            <div className="text-lg font-semibold mb-3">{lang['Feedback']}</div>
            <Textarea placeholder={'Input your feedback for this event'}
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}/>
            <div className="grid grid-cols-2 gap-2">
                <Button variant={'secondary'} onClick={props.close} className={'w-full mt-3'}>
                    {lang['Cancel']}
                </Button>
                <Button variant={'special'} onClick={handleSendFeedback} className={'w-full mt-3'}>
                    {lang['Send']}
                </Button>
            </div>
        </div>
    )
}
