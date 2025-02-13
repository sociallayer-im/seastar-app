import {SolaSdkFunctionParams} from '../types'
import {getGqlClient, getSdkConfig} from '../client'
import {Coupon, DiscountType, Participant, PaymentMethod, TicketItem} from './types'
import {genDaimoLink} from '../service'
import {Profile} from '../profile'
import {
    GET_COUPON_BY_EVENT_ID,
    GET_COUPON_BY_ID,
    GET_TICKET_ITEM_BY_COUPON,
    GET_PURCHASED_TICKET_ITEMS_BY_PROFILE_HANDLE_AND_EVENT_ID
} from './schemas'

export interface TicketPayment {
    authToken: string,
    eventId: number,
    ticketId: number,
    paymentMethodId?: number,
    coupon?: string
}

export const createTicketPayment = async ({params, clientMode}: SolaSdkFunctionParams<TicketPayment>) => {
    const props = {
        auth_token: params.authToken,
        id: params.eventId,
        ticket_id: params.ticketId,
        payment_method_id: params.paymentMethodId,
        coupon: params.coupon
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/ticket/rsvp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create ticket payment')
    }

    const data = await res.json()

    return {
        participant: data.participant as Participant,
        ticketItem: data.ticket_item as TicketItem
    }
}

export interface CreateDaimoOrderProps {
    eventId: number,
    authToken: string,
    paymentMethod: PaymentMethod,
    coupon?: string
    redirectUri?: string
}

export const createDaimoOrder = async ({params, clientMode}: SolaSdkFunctionParams<CreateDaimoOrderProps>) => {
    const {ticketItem, participant} = await createTicketPayment({
        params: {
            authToken: params.authToken,
            eventId: params.eventId,
            ticketId: params.paymentMethod.item_id!,
            coupon: params.coupon,
            paymentMethodId: params.paymentMethod.id
        },
        clientMode,
    })

    const {id, url} = await genDaimoLink({
        params: {
            ticketItemId: ticketItem.id,
            authToken: params.authToken,
            redirectUri: params.redirectUri
        },
        clientMode
    })

    return {
        id,
        url,
        participant,
        ticketItem
    }
}

export const getPurchasedTicketItemsByProfileHandleAndEventId = async ({params, clientMode}: SolaSdkFunctionParams<{
    profileHandle: string,
    eventId: number
}>) => {
    const client = getGqlClient(clientMode)

    const response = await client.query({
        query: GET_PURCHASED_TICKET_ITEMS_BY_PROFILE_HANDLE_AND_EVENT_ID,
        variables: {profileHandle: params.profileHandle, eventId: params.eventId}
    })

    return response.data.ticket_items as TicketItem[]
}

export const getCouponByEventId = async ({params, clientMode}: SolaSdkFunctionParams<{ eventId: number }>) => {
    const client = getGqlClient(clientMode)

    const response = await client.query({
        query: GET_COUPON_BY_EVENT_ID,
        variables: {eventId: params.eventId}
    })

    return response.data.coupons as Coupon[]
}

export const getCouponCodeById = async ({params, clientMode}: SolaSdkFunctionParams<{
    couponId: number,
    authToken: string
}>) => {
    const url = `${getSdkConfig(clientMode).api}/ticket/get_coupon?auth_token=${params.authToken}&id=${params.couponId}`
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error('Failed to get coupon: ' + res.statusText)
    }

    const data = await res.json()

    return data as { coupon_id: number, code: string }
}

export const getCouponById = async ({params, clientMode}: SolaSdkFunctionParams<{
    couponId: number,
}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_COUPON_BY_ID,
        variables: {id: params.couponId}
    })

    if (response.data.coupons[0]) {
        if (response.data.coupons[0].expires_at) {
            response.data.coupons[0].expires_at = response.data.coupons[0].expires_at + 'Z'
        }
        return response.data.coupons[0] as Coupon
    } else {
        return null
    }
}

export interface CouponUsageRecord extends TicketItem {
    profile: Profile
}

export const getCouponUsageRecord = async ({params, clientMode}: SolaSdkFunctionParams<{ couponId: number }>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_TICKET_ITEM_BY_COUPON,
        variables: {couponId: params.couponId}
    })

    return response.data.ticket_items as CouponUsageRecord []
}

export interface CouponDraft {
    discount: number,
    eventId: number
    times?: number,
    validDate?: string,
    discountType: DiscountType,
    label?: string,
    authToken: string
}

export const setCoupon = async ({params, clientMode}: SolaSdkFunctionParams<CouponDraft>) => {
    const props = {
        auth_token: params.authToken,
        event_id: params.eventId,
        coupons_attributes: [
            {
                order_usage_count: 0,
                event_id: params.eventId,
                discount: params.discountType === 'ratio' ? (100 - params.discount) * 100 : params.discount * 100,
                discount_type: params.discountType,
                selector_type: 'code',
                max_allowed_usages: params.times || undefined,
                expires_at: params.validDate || undefined,
                label: params.label || undefined,
            }
        ]
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/ticket/set_coupon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to set coupon')
    }
}

export const validateCoupon = async ({params, clientMode}: SolaSdkFunctionParams<{
    coupon: string,
    eventId: number,
    authToken: string,
    price: number
}>) => {
    const res1 = await fetch(`${getSdkConfig(clientMode).api}/ticket/check_coupon?code=${params.coupon}&event_id=${params.eventId}&auth_token=${params.authToken}`)
    if (!res1.ok) {
        throw new Error('Failed to check coupon')
    }

    const data1 = await res1.json()

    const coupon = data1.coupon as Coupon
    if (!coupon) {
        throw new Error('Invalid coupon')
    }

    const res2 = await fetch(`${getSdkConfig(clientMode).api}/ticket/coupon_price?code=${params.coupon}&event_id=${params.eventId}&auth_token=${params.authToken}&amount=${params.price}`)
    if (!res2.ok) {
        throw new Error('Failed to check coupon')
    }

    const data2 = await res2.json()

    return {
        coupon,
        price: data2.amount as number
    }
}