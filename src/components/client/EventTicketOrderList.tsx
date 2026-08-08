'use client'

import {displayProfileName, getAuth} from '@/utils'
import {Dictionary} from '@/lang'
import {EventDetail, TicketItem, Ticket, Profile, refundTicketItem} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import dynamic from 'next/dynamic'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
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

const DisplayDateTime = dynamic(() => import('@/components/client/DisplayDateTime'))

// soon's EventDetail doesn't embed ticket_items — the page layer supplies
// them (GET /tickets/list?event_id=) alongside the event.
type EventDetailWithOrders = EventDetail & {
    ticket_items?: Array<TicketItem & {user?: Profile | null, ticket?: Ticket | null}>
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
    const router = useRouter()

    // Full refund only in v1 (PAYMENTS_PLAN decision #11). The backend
    // authorizes (owner/co-host; group owner for group tickets) and the
    // refund finalizes asynchronously via the provider's callback — so what
    // comes back here is "submitted", never "refunded".
    const handleRefund = async (ticketItemId: string) => {
        if (!window.confirm(lang['Refund this order'])) return
        try {
            const authToken = getAuth()
            await refundTicketItem({params: {ticketItemId, authToken: authToken!}, clientMode: CLIENT_MODE})
            toast({description: lang['Refund submitted'], variant: 'success'})
            // Soft refresh: the row's status is server-rendered, and a full
            // reload would throw away the operator's place in a long list.
            router.refresh()
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Refund failed',
                variant: 'destructive'
            })
        }
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
                eventDetail.ticket_items?.map(participant => {
                    return <div key={participant.id}
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                        <a className="flex-row-item-center" href={`/profile/${participant.user?.name}`}>
                            <Avatar profile={participant.user || {id: participant.id, name: '', nickname: null, image_url: null}} className="mr-2" size={32}/>
                            <div className="text-xs">
                                <div>{participant.user ? displayProfileName(participant.user) : ''}</div>
                                <div
                                    className="text-gray-400">
                                    <DisplayDateTime dataTimeStr={participant.created_at!} />
                                </div>
                            </div>
                        </a>

                        <div className="flex-row-item-center">
                            <div className="text-sm font-semibold flex-row-item-center">
                                <i className="uil-ticket text-base mr-1" />
                                {participant.ticket?.title}
                            </div>
                            {['refunded', 'partially_refunded', 'disputed'].includes(participant.status || '') &&
                                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                    {participant.status}
                                </span>
                            }
                            {isEventOperator && !!REFUNDABLE_RAILS[participant.chain || ''] &&
                                (participant.status === 'succeeded' || participant.status === 'partially_refunded') &&
                                !!participant.amount &&
                                <Button variant={'ghost'} size={'sm'} className="ml-2 text-red-400"
                                    onClick={() => handleRefund(participant.id)}>
                                    {lang['Refund']}
                                </Button>
                            }
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

