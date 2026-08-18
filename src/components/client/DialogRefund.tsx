'use client'

import {useState} from 'react'
import {refundTicketItem, TicketItemOrder} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {CLIENT_MODE} from '@/app/config'
import {formatOrderAmount, getAuth} from '@/utils'

/**
 * Refund an order, in full or in part.
 *
 * The API has accepted an `amount` since it was written; the UI only ever sent
 * a full refund behind a window.confirm (PAYMENTS_PLAN decision #11), which
 * meant an organizer could not settle a partial dispute without curl.
 *
 * The refundable remainder is computed from the order's own refund rows —
 * pending ones included. A pending refund is money already committed, so
 * leaving it out would let two in-flight partials each claim the same
 * remainder; the backend rejects that, but only after the second one has been
 * written and shown as submitted.
 */
export default function DialogRefund({order, lang, close, onDone}: {
    order: TicketItemOrder
    lang: Dictionary
    close: () => void
    onDone: () => void
}) {
    const total = order.amount || 0
    const committed = (order.refunds || [])
        .filter(r => r.status === 'pending' || r.status === 'succeeded')
        .reduce((sum, r) => sum + (r.amount || 0), 0)
    const remaining = Math.max(0, total - committed)

    // Minor units in the payload, major units in the box — the organizer types
    // 1.5, the API receives 150.
    const toMinor = (major: string) => Math.round(parseFloat(major) * 100)
    const [amountInput, setAmountInput] = useState<string>(String(remaining / 100))
    const [reason, setReason] = useState<string>('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string>('')

    const amount = toMinor(amountInput)
    const valid = !isNaN(amount) && amount > 0 && amount <= remaining
    const isFull = valid && amount === remaining

    const submit = async () => {
        if (!valid) {
            setError(lang['Invalid refund amount'])
            return
        }
        setBusy(true)
        setError('')
        try {
            await refundTicketItem({
                params: {
                    ticketItemId: order.id,
                    // Sent explicitly even when it equals the remainder, so the
                    // request says what the organizer saw rather than relying
                    // on the server recomputing the same number later.
                    amount,
                    reason: reason.trim() || undefined,
                    authToken: getAuth()!
                },
                clientMode: CLIENT_MODE
            })
            onDone()
            close()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Refund failed')
            setBusy(false)
        }
    }

    return <div className="bg-background sm:p-4 p-3 rounded-lg shadow-sm w-[96vw] sm:w-[380px]">
        <div className="flex-row-item-center justify-between mb-4">
            <div className="font-semibold text-lg">{lang['Refund']}</div>
            <i className="uil-times-circle cursor-pointer text-xl text-gray-400" onClick={close}/>
        </div>

        <div className="text-sm text-gray-500 mb-1">
            {lang['Order total']}: {formatOrderAmount(total, order.currency)}
        </div>
        <div className="text-sm text-gray-500 mb-3">
            {lang['Refundable remaining']}: {formatOrderAmount(remaining, order.currency)}
        </div>

        <div className="text-sm mb-1">{lang['Refund amount']}</div>
        <Input type="number"
               value={amountInput}
               inputSize={'md'}
               onWheel={e => e.currentTarget.blur()}
               onChange={e => setAmountInput(e.target.value)}
               className="w-full"/>

        <div className="text-sm mt-3 mb-1">{lang['Refund reason (optional)']}</div>
        <Input type="text"
               value={reason}
               inputSize={'md'}
               onChange={e => setReason(e.target.value)}
               className="w-full"/>

        {/* Decision #10: only a full refund gives the seat back. Saying so
            before the click is the difference between an organizer choosing
            a partial refund and discovering it kept the attendee. */}
        <div className="text-xs text-gray-500 mt-3">
            {isFull ? lang['Full refund releases the seat'] : lang['Partial refund keeps the seat']}
        </div>

        {!!error && <div className="err-msg text-red-400 mt-2 text-xs">{error}</div>}

        <div className="flex-row-item-center mt-4">
            <Button variant={'secondary'} className="flex-1 mr-2 text-sm" onClick={close}>
                {lang['Cancel']}
            </Button>
            <Button variant={'special'} className="flex-1 text-sm" disabled={busy || !valid} onClick={submit}>
                {lang['Refund']}
            </Button>
        </div>
    </div>
}
