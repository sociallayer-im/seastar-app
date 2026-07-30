import {SolaSdkFunctionParams} from '../types'
import {request} from '../request'
import {Coupon, DiscountType, Participant, Ticket, TicketItem} from './types'

export interface TicketPayment {
    authToken: string,
    eventId: string,
    ticketId: string,
    paymentMethodId?: string,
    coupon?: string,
    chain?: string,
    message?: string,
    answers?: Array<{ field_id: string, value: string }>
}

/** RSVP a ticket (free or paid) → {participant, ticketItem}. */
export const createTicketPayment = async ({params, clientMode}: SolaSdkFunctionParams<TicketPayment>) => {
    const data = await request<{ participant: Participant, ticket_item: TicketItem }>(
        `/events/${params.eventId}/tickets/${params.ticketId}/rsvp`, {
            method: 'POST',
            body: {
                message: params.message,
                payment_method_id: params.paymentMethodId,
                coupon: params.coupon,
                chain: params.chain,
                answers: params.answers
            },
            authToken: params.authToken,
            clientMode
        })

    return {
        participant: data.participant,
        ticketItem: data.ticket_item
    }
}

/** Report an on-chain payment's txhash for verification. */
export const submitPaymentTxHash = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId: string,
    txhash: string,
    senderAddress?: string,
    authToken: string
}>) => {
    const data = await request<{ participant: Participant, ticket_item: TicketItem }>('/tickets/verify_payment', {
        method: 'POST',
        body: {
            ticket_item_id: params.ticketItemId,
            txhash: params.txhash,
            sender_address: params.senderAddress
        },
        authToken: params.authToken,
        clientMode
    })
    return {participant: data.participant, ticketItem: data.ticket_item}
}

/** Cancel an unpaid (pending) crypto ticket item. */
export const cancelUnpaidItem = async ({params, clientMode}: SolaSdkFunctionParams<{
    chain: string,
    productId: string,
    itemId: string,
    authToken: string
}>) => {
    const data = await request<{ ticket_item: TicketItem }>('/tickets/cancel_unpaid_item', {
        method: 'POST',
        body: {chain: params.chain, product_id: params.productId, item_id: params.itemId},
        authToken: params.authToken,
        clientMode
    })
    return data.ticket_item
}

export const getPurchasedTicketItemsByProfileNameAndEventId = async ({params, clientMode}: SolaSdkFunctionParams<{
    profileName: string,
    eventId: string,
    authToken: string
}>) => {
    try {
        // The server-side param is still called profile_handle; it matches users.name.
        return await request<TicketItem[]>('/tickets/list', {
            params: {profile_handle: params.profileName, event_id: params.eventId, status: 'succeeded'},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
    } catch {
        return [] as TicketItem[]
    }
}

// --- coupons ---

export const getCouponByEventId = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    try {
        return await request<Coupon[]>('/tickets/coupons', {
            params: {event_id: params.eventId},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
    } catch {
        return [] as Coupon[]
    }
}

export const getCouponCodeById = async ({params, clientMode}: SolaSdkFunctionParams<{
    couponId: string,
    authToken: string
}>) => {
    return await request<{ coupon_id: string, code: string }>('/tickets/get_coupon', {
        params: {id: params.couponId},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const getCouponById = async ({params, clientMode}: SolaSdkFunctionParams<{
    couponId: string,
    authToken: string
}>) => {
    try {
        return await request<Coupon>('/tickets/coupon', {
            params: {id: params.couponId},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
    } catch {
        return null
    }
}

/** Ticket items that used a coupon (each carries its purchaser as `user`). */
export type CouponUsageRecord = TicketItem

export const getCouponUsageRecord = async ({params, clientMode}: SolaSdkFunctionParams<{
    couponId: string,
    authToken: string
}>) => {
    try {
        return await request<CouponUsageRecord[]>('/tickets/coupon_usage', {
            params: {coupon_id: params.couponId},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
    } catch {
        return [] as CouponUsageRecord[]
    }
}

export interface CouponDraft {
    discount: number,
    eventId: string
    times?: number,
    validDate?: string,
    discountType: DiscountType,
    label?: string,
    authToken: string
}

export const setCoupon = async ({params, clientMode}: SolaSdkFunctionParams<CouponDraft>) => {
    await request('/tickets/set_coupon', {
        method: 'POST',
        body: {
            event_id: params.eventId,
            coupons: [
                {
                    // ratio discounts are basis points of the price to PAY
                    // (e.g. 20% off → 8000); amounts are the smallest unit.
                    discount: params.discountType === 'ratio' ? (100 - params.discount) * 100 : params.discount * 100,
                    discount_type: params.discountType,
                    selector_type: 'code',
                    max_allowed_usages: params.times || undefined,
                    expires_at: params.validDate || undefined,
                    label: params.label || undefined,
                }
            ]
        },
        authToken: params.authToken,
        clientMode
    })
}

/** Check a coupon code and compute the discounted price. */
export const validateCoupon = async ({params, clientMode}: SolaSdkFunctionParams<{
    coupon: string,
    eventId: string,
    price: number,
    methodId: string
}>) => {
    const check = await request<{ coupon: Coupon | null }>('/tickets/check_coupon', {
        params: {code: params.coupon, event_id: params.eventId},
        clientMode,
        noCache: true
    })

    if (!check.coupon) {
        throw new Error('Invalid coupon')
    }

    const priced = await request<{ coupon_id: string, amount: number }>('/tickets/coupon_price', {
        params: {code: params.coupon, amount: params.price, payment_method_id: params.methodId},
        clientMode,
        noCache: true
    })

    return {
        coupon: check.coupon,
        price: priced.amount
    }
}

// --- group tickets ---

export const addGroupTicketItem = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string, // group nickname or TSID
    email: string,
    title: string,
    authToken: string
}>) => {
    await request('/tickets/add_group_ticket_item', {
        method: 'POST',
        body: {group_id: params.groupId, email: params.email, title: params.title},
        authToken: params.authToken,
        clientMode
    })
}

export const listGroupTicketTypes = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string // group nickname or TSID
}>) => {
    try {
        return await request<Ticket[]>('/tickets/list_group_ticket_types', {
            params: {group_id: params.groupId},
            clientMode,
            noCache: true
        })
    } catch {
        return [] as Ticket[]
    }
}

// (Stripe checkout/refund/key-management functions live in ../stripe — the
// old getStripeClientSecret/getStripeConfig endpoints were removed from the
// backend along with the Payment-Element flow.)
