import {SolaSdkFunctionParams} from '../types'
import {request} from '../request'
import {Coupon, DiscountType, Participant, Ticket, TicketItem} from './types'
import {Profile} from '../profile/types'

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

/**
 * Abandon an order that never completed, on any rail.
 *
 * Pass `ticketItemId`; the chain/productId/itemId triple is sails' vocabulary
 * and cannot address a card order at all, because those have no chain. The API
 * accepts either.
 *
 * Cancelling releases the held unit and, if it was the buyer's last live order
 * for the event, withdraws them — which is what makes signing up again
 * possible afterwards.
 */
export const cancelUnpaidItem = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId?: string,
    chain?: string,
    productId?: string,
    itemId?: string,
    authToken: string
}>) => {
    const data = await request<{ ticket_item: TicketItem }>('/tickets/cancel_unpaid_item', {
        method: 'POST',
        body: {
            ticket_item_id: params.ticketItemId,
            chain: params.chain,
            product_id: params.productId,
            item_id: params.itemId
        },
        authToken: params.authToken,
        clientMode
    })
    return data.ticket_item
}

/** One refund against an order (RefundBlueprint). Settles asynchronously, so
 *  `pending` is a normal steady state, not a transient one. */
export interface TicketItemRefund {
    id: string
    amount: number
    currency: string
    status: 'pending' | 'succeeded' | 'failed'
    full_refund: boolean
    reason: string | null
    /** The provider's own message when status is 'failed'. */
    error: string | null
    requested_by_user_id: string
    /** The manager who ordered it. */
    requested_by: Profile | null
    created_at: string
    updated_at: string
}

/** One entry in an order's recorded history (TicketingActivityBlueprint). */
export interface TicketingActivity {
    id: string
    /** See soon's Ticketing::Activity::ACTIONS. Wider than the status machine:
     *  retries, rejected callbacks and lost disputes change no status. */
    action: string
    from_status: string | null
    to_status: string | null
    /** api | webhook | sweeper | reconciliation | system | backfill.
     *  'backfill' means reconstructed from timestamps, not observed. */
    source: string
    reason: string | null
    actor_user_id: string | null
    /** The person who did it — null for anything a person did not do (a
     *  callback, the sweeper). That absence is information, not a gap. */
    actor: Profile | null
    metadata: Record<string, unknown>
    created_at: string
}

/** TicketItemBlueprint :order_detail — the organizer's view of an order. */
export interface TicketItemOrder extends TicketItem {
    /** Oldest first. Absent for a non-manager caller. */
    activities?: TicketingActivity[]
    payment_provider?: string | null
    provider_ref?: string | null
    paid_at?: string | null
    released_at?: string | null
    reserved_until?: string | null
    updated_at?: string | null
    ticket?: {id: string, title: string | null, ticket_type: string | null} | null
    /** Oldest first. Absent for a non-manager caller. */
    refunds?: TicketItemRefund[]
}

/**
 * Every order on an event — managers only; the backend 403s otherwise.
 *
 * Returns the :order_detail shape (refunds + timestamps) for a manager, which
 * is what the Orders tab reconstructs each order's history from.
 */
export const getEventTicketItems = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    try {
        return await request<TicketItemOrder[]>('/tickets/list', {
            params: {event_id: params.eventId},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
    } catch {
        // Not a manager, or the event has no orders — an empty tab is the
        // right outcome either way, and the page must still render.
        return [] as TicketItemOrder[]
    }
}

/** One rail+currency row from GET /tickets/order_summary. */
export interface EventOrderSummaryEntry {
    payment_provider: string
    currency: string | null
    /** Minor units (matches TicketItem.amount / formatOrderAmount). */
    gross_amount: number
    /** Only present for payment_provider === 'wechat' — the only rail whose
     *  money sits in the platform's own account rather than the organizer's
     *  (Stripe: organizer's own merchant account; crypto: organizer's own
     *  wallet, direct on-chain). */
    wechat_fee_pct?: number
    sola_fee_pct?: number
    withdrawable_amount?: number
}

/** Organizer-only revenue rollup for the orders tab — managers only. */
export const getEventOrderSummary = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    try {
        const res = await request<{ summary: EventOrderSummaryEntry[] }>('/tickets/order_summary', {
            params: {event_id: params.eventId},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
        return res.summary
    } catch {
        return [] as EventOrderSummaryEntry[]
    }
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

/**
 * My orders for one event that are still awaiting payment.
 *
 * The page needs the ORDER, not just the fact that one exists: cancelling an
 * abandoned attempt takes its id, and `participants.payment_status` — which is
 * all the participant record carries — is a summary with no id in it.
 */
export const getPendingTicketItemsByProfileNameAndEventId = async ({params, clientMode}: SolaSdkFunctionParams<{
    profileName: string,
    eventId: string,
    authToken: string
}>) => {
    try {
        return await request<TicketItem[]>('/tickets/list', {
            params: {profile_handle: params.profileName, event_id: params.eventId, status: 'pending'},
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
