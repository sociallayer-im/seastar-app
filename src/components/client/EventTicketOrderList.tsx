'use client'

import {displayProfileName, formatOrderAmount} from '@/utils'
import {Dictionary} from '@/lang'
import {EventDetail, TicketItemOrder} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import dynamic from 'next/dynamic'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import DialogRefund from '@/components/client/DialogRefund'
import {CLIENT_MODE, STRIPE_ENABLED, WECHAT_PAY_ENABLED} from '@/app/config'
import {useRouter} from 'next/navigation'

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

const STATUS_TONE: Record<string, string> = {
    succeeded: 'bg-green-50 text-green-700',
    pending: 'bg-blue-50 text-blue-700',
    refunded: 'bg-red-50 text-red-600',
    partially_refunded: 'bg-amber-50 text-amber-700',
    disputed: 'bg-amber-50 text-amber-700'
}

const DisplayDateTime = dynamic(() => import('@/components/client/DisplayDateTime'))

// soon's EventDetail doesn't embed ticket_items — the page layer fetches them
// (GET /tickets/list?event_id=) and attaches them. Nothing did that until
// 2026-08-08, which is why this tab had always rendered empty.
type EventDetailWithOrders = EventDetail & {
    ticket_items?: TicketItemOrder[]
}

export interface EventParticipantListProps {
    lang: Dictionary
    eventDetail: EventDetailWithOrders
    isEventOperator?: boolean
}

export default function EventTicketOrderList({
                                                 lang,
                                                 eventDetail,
                                                 isEventOperator
                                             }: EventParticipantListProps) {
    const {toast} = useToast()
    const {openModal} = useModal()
    const router = useRouter()

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
                    // Soft refresh: the row is server-rendered, and a full
                    // reload would throw away the operator's place in a long
                    // list.
                    router.refresh()
                }}
            />,
            clickOutsideToClose: true
        })
    }

    /**
     * What happened to an order, oldest first.
     *
     * Derived, not stored: there is no transitions log, so this is built from
     * the timestamps each transition writes plus the refund rows. That covers
     * ordering, payment and every refund with its outcome. It does NOT show
     * why an order expired or was cancelled — those leave only a terminal
     * status and an updated_at, so they appear as a single closing line.
     */
    const orderHistory = (order: TicketItemOrder) => {
        const entries: Array<{at: string, label: string, note?: string, tone?: string}> = []

        if (order.created_at) entries.push({at: order.created_at, label: lang['Order placed']})
        if (order.paid_at) entries.push({at: order.paid_at, label: lang['Order paid'], tone: 'text-green-600'})

        ;(order.refunds || []).forEach(refund => {
            const money = formatOrderAmount(refund.amount, refund.currency)
            const scope = refund.full_refund ? lang['Full refund'] : lang['Partial refund']
            if (refund.status === 'succeeded') {
                entries.push({
                    at: refund.updated_at || refund.created_at,
                    label: `${lang['Refunded']} ${money}`,
                    note: [scope, refund.reason].filter(Boolean).join(' · '),
                    tone: 'text-red-500'
                })
            } else if (refund.status === 'failed') {
                entries.push({
                    at: refund.updated_at || refund.created_at,
                    label: `${lang['Refund failed']} ${money}`,
                    note: refund.error || undefined,
                    tone: 'text-red-500'
                })
            } else {
                entries.push({
                    at: refund.created_at,
                    label: `${lang['Refund requested']} ${money}`,
                    note: [scope, refund.reason].filter(Boolean).join(' · '),
                    tone: 'text-amber-600'
                })
            }
        })

        // A terminal state with no timestamp of its own beyond updated_at.
        if ((order.status === 'timeout' || order.status === 'cancelled') && order.updated_at) {
            entries.push({
                at: order.updated_at,
                label: order.status === 'timeout' ? lang['Order expired'] : lang['Order cancelled'],
                tone: 'text-gray-400'
            })
        }

        return entries.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    }

    const downloadCSV = () => {
        const title = ['Username', 'Nickname', 'Email', 'Payment wallet address', 'Status', 'Create time', 'Ticket Type']
        const rows = eventDetail.ticket_items?.map((item) => {
            return [item.user?.name || '',
                item.user?.nickname || '',
                item.user?.email || '',
                item.sender_address || '',
                item.status,
                item.created_at || '',
                item.ticket?.title || ''
            ]
        }) || []

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
        {!!eventDetail && !!eventDetail.ticket_items?.length && isEventOperator &&
            <div onClick={downloadCSV}
                 className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                <i className="uil-download-alt text-lg mr-1"/>
                <span>{lang['Download the list of order']}</span>
            </div>}
        <div>
            {
                eventDetail.ticket_items?.map(order => {
                    const history = orderHistory(order)
                    return <div key={order.id} className="border-b-[1px] border-gray-200 py-4">
                        <div className="flex flex-row justify-between items-center">
                            <a className="flex-row-item-center" href={`/profile/${order.user?.name}`}>
                                <Avatar profile={order.user || {id: order.id, name: '', nickname: null, image_url: null}} className="mr-2" size={32}/>
                                <div className="text-xs">
                                    <div>{order.user ? displayProfileName(order.user) : ''}</div>
                                    <div className="text-gray-400">
                                        <DisplayDateTime dataTimeStr={order.created_at!} />
                                    </div>
                                </div>
                            </a>

                            <div className="flex-row-item-center">
                                <div className="text-sm font-semibold flex-row-item-center">
                                    <i className="uil-ticket text-base mr-1" />
                                    {order.ticket?.title}
                                </div>
                                {!!order.amount &&
                                    <div className="ml-2 text-sm font-semibold">
                                        {formatOrderAmount(order.amount, order.currency)}
                                    </div>
                                }
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${STATUS_TONE[order.status || ''] || 'bg-gray-100 text-gray-500'}`}>
                                    {lang[ORDER_STATUS_LABEL[order.status || ''] as keyof typeof lang] || order.status}
                                </span>
                                {isEventOperator && !!REFUNDABLE_RAILS[order.chain || ''] &&
                                    (order.status === 'succeeded' || order.status === 'partially_refunded') &&
                                    !!order.amount &&
                                    <Button variant={'ghost'} size={'sm'} className="ml-2 text-red-400"
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
                                {history.map((entry, i) =>
                                    <div key={i} className="flex-row-item-center">
                                        <span className="text-gray-300 mr-2">·</span>
                                        <span className={`mr-2 ${entry.tone || ''}`}>{entry.label}</span>
                                        <span className="text-gray-400"><DisplayDateTime dataTimeStr={entry.at}/></span>
                                        {!!entry.note && <span className="ml-2 text-gray-400">{entry.note}</span>}
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

