'use client'

import { Button } from '@/components/shadcn/Button'
import { Dictionary } from '@/lang'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import type {ReactNode} from 'react'
import {EDGE_CITY_TICKET_URL} from '@/app/configForSpecifyGroup'

export default function GoToBuyTicket({ lang, title, content, buttonLabel }: {
    lang: Dictionary
    title?: string
    content?: ReactNode
    buttonLabel?: string
}) {
    const { showConfirmDialog } = useConfirmDialog()

    const handleGoToBuyTicket = () => {
        showConfirmDialog({
            lang,
            title: title || 'Join Event',
            content: content || <>
                Please purchase the ticket to join the event.
                <div className="mt-2">
                    <a className="text-[#097eff] underline whitespace-nowrap"
                       href={EDGE_CITY_TICKET_URL} target="_blank" rel="noreferrer">Go to Purchase Ticket</a>
                </div>
            </>,
            type: 'info'
        })
    }

    return <Button variant={'primary'}
        onClick={handleGoToBuyTicket}
        className="text-xs flex-1">
        {buttonLabel || lang['Join Event(RSVP)']}
    </Button>
}