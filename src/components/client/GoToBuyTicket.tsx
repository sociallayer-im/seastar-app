'use client'

import { Button } from '@/components/shadcn/Button'
import { Dictionary } from '@/lang'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {edgeCityTicketContent} from '@/app/configForSpecifyGroup'

export default function GoToBuyTicket({ lang, title, content, buttonLabel }: {
    lang: Dictionary
    title?: string
    content?: string
    buttonLabel?: string
}) {
    const { showConfirmDialog } = useConfirmDialog()

    const handleGoToBuyTicket = () => {
        showConfirmDialog({
            lang,
            title: title || 'Join Event',
            content: content || edgeCityTicketContent,
            type: 'info'
        })
    }

    return <Button variant={'primary'}
        onClick={handleGoToBuyTicket}
        className="text-xs flex-1">
        {buttonLabel || lang['Join Event(RSVP)']}
    </Button>
}