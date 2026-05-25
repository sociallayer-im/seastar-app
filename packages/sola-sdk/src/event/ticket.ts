import {SolaSdkFunctionParams} from '../types'
import {getSdkConfig} from '../client'
import {Coupon, DiscountType, Participant, PaymentMethod, TicketItem} from './types'
import {Profile} from '../profile'
import {fixDate} from '../uitls'

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

export const getPurchasedTicketItemsByProfileHandleAndEventId = async ({params, clientMode}: SolaSdkFunctionParams<{
    profileHandle: string,
    eventId: number
}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/ticket/list?profile_handle=${encodeURIComponent(params.profileHandle)}&event_id=${params.eventId}&status=succeeded`)
    if (!resp.ok) return [] as TicketItem[]
    const data = await resp.json()
    return (data.ticket_items || []) as TicketItem[]
}

export const getCouponByEventId = async ({params, clientMode}: SolaSdkFunctionParams<{ eventId: number }>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/ticket/coupons?event_id=${params.eventId}`)
    if (!resp.ok) return [] as Coupon[]
    const data = await resp.json()
    return (data.coupons || []) as Coupon[]
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
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/ticket/coupon?id=${params.couponId}`)
    if (!resp.ok) return null
    const data = await resp.json()
    if (!data.coupon) return null
    if (data.coupon.expires_at) {
        data.coupon.expires_at = data.coupon.expires_at + 'Z'
    }
    return data.coupon as Coupon
}

export interface CouponUsageRecord extends TicketItem {
    profile: Profile
}

export const getCouponUsageRecord = async ({params, clientMode}: SolaSdkFunctionParams<{ couponId: number }>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/ticket/coupon_usage?coupon_id=${params.couponId}`)
    if (!resp.ok) return [] as CouponUsageRecord[]
    const data = await resp.json()
    return (data.ticket_items || []).map((t: CouponUsageRecord) => fixDate(t)) as CouponUsageRecord[]
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
    price: number,
    methodId: number
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

    const res2 = await fetch(`${getSdkConfig(clientMode).api}/ticket/coupon_price?code=${params.coupon}&event_id=${params.eventId}&auth_token=${params.authToken}&amount=${params.price}&payment_method_id=${params.methodId}`)
    if (!res2.ok) {
        throw new Error('Failed to check coupon')
    }

    const data2 = await res2.json()

    return {
        coupon,
        price: data2.amount as number
    }
}