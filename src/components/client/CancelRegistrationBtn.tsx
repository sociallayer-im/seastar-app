'use client'

import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {cancelUnpaidItem, cancelParticipant} from '@sola/sdk'
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
 * Only for registrations that did NOT succeed. Giving back a paid ticket is a
 * refund, which is the organizer's action and a different flow entirely.
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
    kind: 'order' | 'application'
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
            } else {
                return
            }

            toast({
                title: kind === 'order' ? lang['Order cancelled'] : lang['Application cancelled'],
                variant: 'success'
            })
            window.location.reload()
        } catch (e: unknown) {
            toast({
                title: e instanceof Error ? e.message : 'Failed to cancel',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <Button
        variant={'secondary'}
        className={className}
        onClick={() => showConfirmDialog({
            lang,
            type: 'danger',
            title: kind === 'order' ? lang['Cancel Order'] : lang['Cancel Application'],
            content: kind === 'order'
                ? lang['Are you sure you want to cancel this order? You can register again afterwards.']
                : lang['Are you sure you want to withdraw your application? You can apply again afterwards.'],
            onConfig: doCancel
        })}>
        <span>{kind === 'order' ? lang['Cancel Order'] : lang['Cancel Application']}</span>
    </Button>
}
