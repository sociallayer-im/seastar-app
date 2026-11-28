'use client'

import {EventDetail, ProfileDetail, Ticket, TicketItem, SolaApiError, createStripeCheckoutSession, createWechatPrepay} from '@sola/sdk'
import {Dictionary} from '@/lang'
import CancelRegistrationBtn from '@/components/client/CancelRegistrationBtn'
import {Button} from '@/components/shadcn/Button'
import {CLIENT_MODE} from '@/app/config'
import {invokeWechatPay, isMobileWechatBrowser} from '@/utils/wechat_pay'
import {useState} from 'react'
import NoData from '@/components/NoData'
import {getAuth, displayTicketPrice, getPaymentMethodChainIcons} from '@/utils'
import useModal from '@/components/client/Modal/useModal'
import dynamic from 'next/dynamic'

// DialogTicket (viem payment path) only loads when the dialog is opened
const DialogTicket = dynamic(() => import('@/components/client/DialogTicket'))

export default function TicketList({eventDetail, lang, currProfile, attended, paymentPending, pendingOrders = []}: {
    eventDetail: EventDetail,
    lang: Dictionary,
    currProfile?: null | ProfileDetail,
    attended?: boolean,
    /** An order of theirs is awaiting payment/confirmation — buying again would
     *  create a second order for the same seat. */
    paymentPending?: boolean
    pendingOrders?: TicketItem[]
}) {

    const {openModal} = useModal()
    const [resuming, setResuming] = useState<string | null>(null)
    const [error, setError] = useState<{id: string, message: string} | null>(null)
    const cancellationStarted = ['cancelling', 'cancelled'].includes(eventDetail.status || '')
    const locked = cancellationStarted || attended || paymentPending || pendingOrders.length > 0

    const resumeOrder = async (order: TicketItem) => {
        const authToken = getAuth()
        if (!authToken || resuming) return
        setResuming(order.id)
        setError(null)
        const request = {params: {ticketItemId: order.id, authToken}, clientMode: CLIENT_MODE}
        try {
            if (order.chain === 'stripe') {
                const {checkout_url} = await createStripeCheckoutSession(request)
                window.location.assign(checkout_url)
                return
            }
            if (!isMobileWechatBrowser()) throw new Error(lang['Open in WeChat to pay'])
            const {pay_params} = await createWechatPrepay(request)
            const outcome = await invokeWechatPay(pay_params)
            if (outcome === 'ok') {
                window.location.assign(`/event/detail/${eventDetail.id}?payment=success`)
                return
            }
            const message = outcome === 'cancel' ? lang['Payment cancelled'] : lang['Payment failed, please try again']
            setError({id: order.id, message})
        } catch (e) {
            if (order.chain === 'wechat' && e instanceof SolaApiError && e.code === 'OPENID_REQUIRED') {
                const back = encodeURIComponent(window.location.pathname + window.location.search)
                window.location.assign(`/api/wechat/bind-openid?return=${back}`)
                return
            }
            setError({id: order.id, message: e instanceof Error ? e.message : lang['Payment failed, please try again']})
        } finally {
            setResuming(null)
        }
    }

    const showTicket = (ticket: Ticket, order?: TicketItem) => {
        if (locked && !order) return
        openModal({
            content: (close) => <DialogTicket
                eventDetail={eventDetail}
                ticket={ticket}
                existingOrder={order}
                lang={lang}
                currProfile={currProfile}
                close={close!}
            />,
            clickOutsideToClose: true
        })
    }

    const tickets = eventDetail?.tickets

    return <div>
        <div className="border-gray-200 p-4">
            {attended && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-3">You have already registered for this event.</div>}
            {((!attended && paymentPending) || pendingOrders.length > 0) &&
                <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-3">
                    {lang[cancellationStarted ? 'Cancellation payment notice' : 'Order awaiting payment']}
                    {pendingOrders.map(order => {
                        const ticket = tickets?.find(item => item.id === order.ticket_id)
                        const participant = eventDetail.current_participant
                        const awaitingApproval = participant?.id === order.participant_id && participant?.status === 'pending'
                        const fiat = order.chain === 'stripe' || order.chain === 'wechat'
                        const currency = order.currency || (order.chain === 'stripe' ? 'usd' : 'cny')
                        const amount = fiat && order.amount !== null
                            ? new Intl.NumberFormat(undefined, {style: 'currency', currency}).format(order.amount / 100)
                            : null
                        return <div key={order.id} className="mt-3 border-t border-blue-200 pt-3">
                            <div className="font-semibold">{ticket?.title || lang['Unpaid order']}</div>
                            {amount && <p className="mt-1">{amount}</p>}
                            {awaitingApproval && <p className="mt-1">{lang['Under Review']}</p>}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {!cancellationStarted && !awaitingApproval && (fiat || ticket) &&
                                    <Button disabled={!!resuming} onClick={() => fiat ? void resumeOrder(order) : ticket && showTicket(ticket, order)}>
                                        {lang['Continue payment']}
                                    </Button>}
                                {!cancellationStarted &&
                                    <CancelRegistrationBtn lang={lang} kind="order" eventId={eventDetail.id}
                                                       ticketItemId={order.id}/>}
                            </div>
                            {error?.id === order.id && <p role="alert" className="mt-2 text-red-600">{error.message}</p>}
                        </div>
                    })}
                </div>}
            {!tickets || tickets.length === 0 && <NoData/>}
            {tickets?.map(ticket => {
                const unavailable = locked
                return <div key={ticket.id}
                            onClick={() => !unavailable && showTicket(ticket)}
                            className={`bg-gray-100 p-4 rounded-lg mb-3 border-2 ${unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#baffad] hover:bg-[#effff9]'}`}>
                    <div className="font-semibold">{ticket.title}</div>
                    <div className="text-xs my-2 wrap-break-word text-gray-500">
                        {ticket.content}
                    </div>

                    {ticket.payment_methods?.length === 0 ?
                        <div className="flex flex-row items-center justify-between mt-1">
                            <div className="font-semibold text-pink-500 text-xl">Free</div>
                        </div>
                        : <div className="flex flex-row items-center justify-between mt-1">
                            <div className="font-semibold text-pink-500 text-xl">
                                {displayTicketPrice(ticket)}
                            </div>
                            <div className="flex flex-row items-center">
                                {
                                    (ticket.payment_methods || []).flatMap((method, mi) =>
                                        getPaymentMethodChainIcons(method).map((icon, ci) =>
                                            <img key={`${mi}-${ci}`}
                                                 className="shadow-sm min-w-5 h-5 rounded-full mr-[-6px] bg-white"
                                                 src={icon}
                                                 alt="" width={20} height={20}/>
                                        )
                                    )
                                }
                            </div>
                        </div>
                    }
                </div>
            })
            }
        </div>
    </div>
}