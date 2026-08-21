'use client'

import {displayProfileName, formatOrderAmount} from '@/utils'
import {Dictionary} from '@/lang'
import {EventDetail, EventOrderSummaryEntry, TicketItemOrder} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import dynamic from 'next/dynamic'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import DialogRefund from '@/components/client/DialogRefund'
import {CLIENT_MODE, STRIPE_ENABLED, WECHAT_PAY_ENABLED} from '@/app/config'

// Which fiat rails this deployment can refund through. Refunding needs the
// rail's own API, so the button has to follow the deployment, not just the
// order: SG can refund cards, CN can refund WeChat, neither can do the other.
// Written as a map because the previous `chain === 'stripe'` test silently
// hid the button for every WeChat order on CN — the backend has dispatched
// refunds by provider since day one, so this was the only thing missing.
const REFUNDABLE_RAILS: Record<string, boolean> = {
    stripe: STRIPE_ENABLED,
    wechat: WECHAT_PAY_ENABLED
}

// The wire keeps the legacy status names (pending == awaiting payment,
// succeeded == paid, timeout == expired) because the deployed clients match on
// those strings — see soon's TicketItem. Only the label is translated.
const ORDER_STATUS_LABEL: Record<string, string> = {
    pending: 'Awaiting payment',
    succeeded: 'Paid',
    refunded: 'Refunded',
    partially_refunded: 'Partially refunded',
    disputed: 'Disputed',
    timeout: 'Expired',
    cancelled: 'Cancelled'
}

// Ticketing::Activity::ACTIONS → dictionary key. An action with no entry falls
// back to its own name, so a new backend action shows up as a readable slug
// rather than vanishing from the timeline.
const ACTIVITY_LABEL: Record<string, string> = {
    order_placed: 'Order placed',
    prepay_created: 'Payment started',
    checkout_session_created: 'Payment started',
    payment_confirmed: 'Order paid',
    payment_failed: 'Payment failed',
    payment_retried: 'Payment retried',
    callback_rejected: 'Payment notice rejected',
    order_expired: 'Order expired',
    order_cancelled: 'Order cancelled',
    inventory_released: 'Seat released',
    refund_requested: 'Refund requested',
    refund_succeeded: 'Refunded',
    refund_failed: 'Refund failed',
    dispute_opened: 'Dispute opened',
    dispute_won: 'Dispute won',
    dispute_lost: 'Dispute lost',
    coupon_redeemed: 'Coupon used',
    ticket_granted: 'Ticket granted',
    status_changed: 'Status changed'
}

const ACTIVITY_TONE: Record<string, string> = {
    payment_confirmed: 'text-green-600',
    dispute_won: 'text-green-600',
    refund_requested: 'text-amber-600',
    payment_retried: 'text-amber-600',
    refund_succeeded: 'text-red-500',
    refund_failed: 'text-red-500',
    payment_failed: 'text-red-500',
    callback_rejected: 'text-red-500',
    dispute_lost: 'text-red-500',
    dispute_opened: 'text-amber-600'
}

// Where the row's own amount is the point, rather than a repeat of the order's.
const MONEY_ACTIONS = ['refund_requested', 'refund_succeeded', 'refund_failed']

const STATUS_TONE: Record<string, string> = {
    succeeded: 'bg-green-50 text-green-700',
    pending: 'bg-blue-50 text-blue-700',
    refunded: 'bg-red-50 text-red-600',
    partially_refunded: 'bg-amber-50 text-amber-700',
    disputed: 'bg-amber-50 text-amber-700'
}

const DisplayDateTime = dynamic(() => import('@/components/client/DisplayDateTime'))

export interface EventTicketOrderListProps {
    lang: Dictionary
    /** Orders on this event (GET /tickets/list?event_id=). soon's EventDetail
     *  doesn't embed them; this tab used to read `eventDetail.ticket_items`,
     *  which nothing ever set, so it rendered empty on every deployment and
     *  the refund button inside it was unreachable. Now the caller fetches
     *  them when the tab is opened. */
    orders: TicketItemOrder[]
    /** Per-rail revenue rollup (GET /tickets/order_summary) — empty until it
     *  loads or when there's nothing to show. */
    summary?: EventOrderSummaryEntry[]
    /** Reload the orders after a refund, so the row's new status and its new
     *  history entry appear without a page navigation. */
    onChanged?: () => void | Promise<void>
    isEventOperator?: boolean
}

export default function EventTicketOrderList({
                                                 lang,
                                                 orders,
                                                 summary,
                                                 onChanged,
                                                 isEventOperator
                                             }: EventTicketOrderListProps) {
    const {toast} = useToast()
    const {openModal} = useModal()

    // The backend authorizes (owner/co-host; group owner for group tickets)
    // and the refund finalizes asynchronously via the provider's callback —
    // so what comes back is "submitted", never "refunded".
    const handleRefund = (order: TicketItemOrder) => {
        openModal({
            content: (close) => <DialogRefund
                order={order}
                lang={lang}
                close={close!}
                onDone={() => {
                    toast({description: lang['Refund submitted'], variant: 'success'})
                    // Re-fetch just this list. Nothing else on the page changed,
                    // and the operator keeps their place in it.
                    void onChanged?.()
                }}
            />,
            clickOutsideToClose: true
        })
    }

    /**
     * What happened to an order, oldest first — read from the recorded
     * history, not derived from timestamps.
     *
     * The derivation this replaces could not see a retry or a rejected
     * callback (neither changes status), could not tell a voluntary refund
     * from a lost dispute (both land on `refunded`), and dated closures by
     * `updated_at`, which is the last write of any kind rather than the moment
     * of the transition.
     */
    const orderHistory = (order: TicketItemOrder) =>
        (order.activities || []).map(activity => {
            const money = formatOrderAmount(
                activity.metadata?.amount as number | undefined,
                (activity.metadata?.currency as string | undefined) ?? order.currency
            )
            return {
                at: activity.created_at,
                label: lang[ACTIVITY_LABEL[activity.action] as keyof typeof lang] || activity.action,
                // Money is only worth repeating where it differs from the
                // order's own amount — a partial refund, say.
                amount: MONEY_ACTIONS.includes(activity.action) ? money : '',
                note: activity.reason || undefined,
                // Accountability: a refund moves money out, so the manager who
                // ordered it is named. Nobody is named for a callback or the
                // sweeper, and that blank is the record of "not a person".
                actor: activity.actor?.nickname || activity.actor?.name || '',
                tone: ACTIVITY_TONE[activity.action] || 'text-gray-500',
                // A reconstructed row is not evidence, and the UI should not
                // let it look like one.
                derived: activity.source === 'backfill'
            }
        })

    const downloadCSV = () => {
        const title = ['Username', 'Nickname', 'Email', 'Payment wallet address', 'Status', 'Create time', 'Ticket Type']
        const rows = orders.map((item) => {
            return [item.user?.name || '',
                item.user?.nickname || '',
                item.user?.email || '',
                item.sender_address || '',
                item.status,
                item.created_at || '',
                item.ticket?.title || ''
            ]
        })

        const csvContent = "data:text/csv;charset=utf-8,"
            + title.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)

        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "orders.csv")
        document.body.appendChild(link) // Required for FF
        link.click()
        link.remove()
    }

    return <div>
        {isEventOperator && !!summary?.length &&
            <div className="mb-4 rounded-lg border border-gray-200 divide-y divide-gray-100">
                {summary.map(entry =>
                    <div key={`${entry.payment_provider}-${entry.currency}`} className="p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                                {lang['Total revenue']} ({entry.payment_provider})
                            </span>
                            <span className="font-semibold">
                                {formatOrderAmount(entry.gross_amount, entry.currency)}
                            </span>
                        </div>
                        {entry.withdrawable_amount !== undefined &&
                            <>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-gray-500">{lang['Available to withdraw']}</span>
                                    <span className="font-semibold text-green-600">
                                        {formatOrderAmount(entry.withdrawable_amount, entry.currency)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {lang['WeChat Pay charges a {wechat_pct}% fee and sola charges a {sola_pct}% fee; the rest is available to withdraw.']
                                        .replace('{wechat_pct}', String(entry.wechat_fee_pct))
                                        .replace('{sola_pct}', String(entry.sola_fee_pct))}
                                </div>
                            </>
                        }
                    </div>
                )}
            </div>
        }
        {!!orders.length && isEventOperator &&
            <div onClick={downloadCSV}
                 className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                <i className="uil-download-alt text-lg mr-1"/>
                <span>{lang['Download the list of order']}</span>
            </div>}
        {!orders.length &&
            <div className="py-8 text-center text-sm text-gray-400">{lang['No orders yet']}</div>
        }
        <div>
            {
                orders.map(order => {
                    const history = orderHistory(order)
                    return <div key={order.id} className="border-b border-gray-200 py-4">
                        {/* Stacked on a phone: the meta side alone is a ticket
                            title, an amount, a status and a refund button, which
                            never fit beside an avatar at 390px — they used to
                            simply run off the edge. */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center sm:gap-0">
                            <a className="flex-row-item-center min-w-0" href={`/profile/${order.user?.name}`}>
                                <Avatar profile={order.user || {id: order.id, name: '', nickname: null, image_url: null}} className="mr-2 shrink-0" size={32}/>
                                <div className="text-xs min-w-0">
                                    <div className="truncate">{order.user ? displayProfileName(order.user) : ''}</div>
                                    <div className="text-gray-400">
                                        <DisplayDateTime dataTimeStr={order.created_at!} />
                                    </div>
                                </div>
                            </a>

                            <div className="flex flex-row items-center flex-wrap gap-x-2 gap-y-1 pl-10 sm:pl-0 sm:justify-end">
                                <div className="text-sm font-semibold flex-row-item-center min-w-0">
                                    <i className="uil-ticket text-base mr-1 shrink-0" />
                                    <span className="truncate">{order.ticket?.title}</span>
                                </div>
                                {!!order.amount &&
                                    <div className="text-sm font-semibold">
                                        {formatOrderAmount(order.amount, order.currency)}
                                    </div>
                                }
                                <span className={`text-xs px-1.5 py-0.5 rounded-sm whitespace-nowrap ${STATUS_TONE[order.status || ''] || 'bg-gray-100 text-gray-500'}`}>
                                    {lang[ORDER_STATUS_LABEL[order.status || ''] as keyof typeof lang] || order.status}
                                </span>
                                {isEventOperator && !!REFUNDABLE_RAILS[order.chain || ''] &&
                                    (order.status === 'succeeded' || order.status === 'partially_refunded') &&
                                    !!order.amount &&
                                    <Button variant={'ghost'} size={'sm'} className="text-red-400 h-auto py-1 px-2"
                                        onClick={() => handleRefund(order)}>
                                        {lang['Refund']}
                                    </Button>
                                }
                            </div>
                        </div>

                        {/* Why this is here rather than behind a click: the
                            question an organizer opens this tab with is
                            usually "what happened to THIS order", and a
                            status alone never answers it. */}
                        {history.length > 1 &&
                            <div className="mt-3 pl-10 text-xs text-gray-500 grid grid-cols-1 gap-1">
                                {history.map(entry =>
                                    <div key={entry.at + entry.label} className="flex-row-item-center flex-wrap">
                                        <span className="text-gray-300 mr-2">·</span>
                                        <span className={`mr-2 ${entry.tone}`}>{entry.label}</span>
                                        {!!entry.amount && <span className="mr-2 font-semibold">{entry.amount}</span>}
                                        <span className="text-gray-400"><DisplayDateTime dataTimeStr={entry.at}/></span>
                                        {!!entry.actor &&
                                            <span className="ml-2 text-gray-500">
                                                <i className="uil-user text-sm mr-0.5"/>{entry.actor}
                                            </span>
                                        }
                                        {!!entry.note && <span className="ml-2 text-gray-400">{entry.note}</span>}
                                        {entry.derived &&
                                            <span className="ml-2 text-gray-300" title={lang['Reconstructed entry']}>
                                                ({lang['estimated']})
                                            </span>
                                        }
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                })
            }
        </div>
    </div>
}

