'use client'

import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {cancelUnpaidItem, cancelParticipant, cancelAttendEvent} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {useToast} from '@/components/shadcn/Toast/use-toast'

/**
 * Backing out of a registration that never completed — an order abandoned at
 * the payment step, or an application still under review.
 *
 * This exists because the states it covers used to be dead ends: the page said
 * "awaiting payment" or "under review" and offered nothing, while the API
 * refused a second attempt ("you already have an unpaid order for this
 * ticket"). Cancelling releases the held unit and withdraws the participant,
 * which is what makes the register/buy buttons come back on reload — so the
 * page is deliberately reloaded rather than patched in place.
 *
 * Settled registrations can also be withdrawn; paid tickets require an
 * organizer refund before the backend permits cancellation.
 */
export default function CancelRegistrationBtn({
    lang, className, ticketItemId, participantId, eventId, kind
}: {
    lang: Dictionary
    className?: string
    /** The order awaiting payment, when that is what is being abandoned. */
    ticketItemId?: string | null
    /** The participant row, for an application with no order behind it. */
    participantId?: string | null
    eventId: string
    kind: 'order' | 'application' | 'participation' | 'remove'
}) {
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const doCancel = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) throw new Error(lang['Please login first'])

            if (ticketItemId) {
                await cancelUnpaidItem({params: {ticketItemId, authToken}, clientMode: CLIENT_MODE})
            } else if (participantId) {
                await cancelParticipant({
                    params: {eventId, participantId, authToken},
                    clientMode: CLIENT_MODE
                })
            } else if (kind === 'participation') {
                await cancelAttendEvent({params: {eventId, authToken}, clientMode: CLIENT_MODE})
            } else {
                return
            }

            toast({
                title: kind === 'remove' ? lang['Participant removed'] : kind === 'order' ? lang['Order cancelled'] : kind === 'participation' ? lang['Participation cancelled'] : lang['Application cancelled'],
                variant: 'success'
            })
            window.location.reload()
        } catch (e: unknown) {
            toast({
                title: e instanceof Error && e.message.includes('refund required before cancel')
                    ? lang['Contact the organizer to arrange a refund before cancelling.']
                    : e instanceof Error ? e.message : 'Failed to cancel',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const label = kind === 'remove' ? lang['Remove participant'] : kind === 'order' ? lang['Cancel Order']
        : kind === 'participation' ? lang['Cancel Participation'] : lang['Cancel Application']

    return <Button
        type="button"
        variant={'secondary'}
        className={className}
        onClick={() => showConfirmDialog({
            lang,
            type: 'danger',
            title: label,
            content: kind === 'remove' ? lang['Remove this participant? Paid orders can still be refunded from Orders.'] : kind === 'order'
                ? lang['Are you sure you want to cancel this order? You can register again afterwards.']
                : kind === 'participation'
                    ? lang['Cancel participation confirmation with refund']
                    : lang['Are you sure you want to withdraw your application? You can apply again afterwards.'],
            onConfig: doCancel
        })}>
        <span>{label}</span>
    </Button>
}
