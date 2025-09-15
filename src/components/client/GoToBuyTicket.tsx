'use client'

import { Button } from '@/components/shadcn/Button'
import { Dictionary } from '@/lang'
import useConfirmDialog from '@/hooks/useConfirmDialog'

export default function GoToBuyTicket({ lang }: { lang: Dictionary }) {
    const { showConfirmDialog } = useConfirmDialog()

    const handleGoToBuyTicket = () => {
        showConfirmDialog({
            lang,
            title: 'Join Event',
            content: 'Please purchase the ticket to join the event. <br /><a style="color: #097eff; text-decoration: underline; white-space: nowrap;" href="https://edgecity.simplefi.tech/checkout?group=direct-invites-patagonia" target="_blank">Go to Purchase Ticket</a>',
            type: 'info'
        })
    }
    
    return <Button variant={'primary'} 
        onClick={handleGoToBuyTicket}
        className="text-xs flex-1">
        {lang['Join Event(RSVP)']}
    </Button>
}