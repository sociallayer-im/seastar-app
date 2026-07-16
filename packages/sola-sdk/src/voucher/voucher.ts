import {request, requestOrNull, Paginated} from '../request'
import {type Voucher} from './types'
import {Badge} from '../badge'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get vouchers sent by a user
 * @param name - sender's username
 */
export const getVoucherBySenderName = async ({params, clientMode}: SolaSdkFunctionParams<{name: string}>) => {
    const res = await request<Paginated<Voucher>>('/vouchers', {
        clientMode,
        params: {sender_handle: params.name}
    })
    return res.data
}

/**
 * Get voucher detail by id (includes minted badges)
 */
export const getVoucherDetailById = async ({params, clientMode}: SolaSdkFunctionParams<{id: string}>) => {
    return await requestOrNull<Voucher>(`/vouchers/${params.id}`, {clientMode})
}

/**
 * Get vouchers of a group
 * @param groupName - group's name slug
 */
export const getGroupVoucherByGroupName = async ({params, clientMode}: SolaSdkFunctionParams<{groupName: string}>) => {
    const res = await request<Paginated<Voucher>>('/vouchers', {
        clientMode,
        params: {group_handle: params.groupName}
    })
    return res.data
}

export type SendCodeVoucherParams = {
    badgeClassId: string,
    authToken: string,
    message?: string,
    amount?: number
}

/**
 * Mint a code-strategy voucher (redeemable `amount` times). Returns :with_code.
 */
export const sendCodeVoucher = async ({params, clientMode}: SolaSdkFunctionParams<SendCodeVoucherParams>) => {
    return await request<Voucher>('/vouchers', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {
            badge_class_id: params.badgeClassId,
            message: params.message,
            counter: params.amount
        }
    })
}

export type SendAccountVoucherParams = {
    badgeClassId: string,
    authToken: string,
    message?: string,
    receivers: string[]
}

/**
 * Send badges to named receivers (username / eth address / email — soon
 * resolves and validates the whole batch atomically server-side).
 */
export const sendAccountVoucher = async ({params, clientMode}: SolaSdkFunctionParams<SendAccountVoucherParams>) => {
    return await request<Voucher[]>('/vouchers/send_badge', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {
            badge_class_id: params.badgeClassId,
            receivers: params.receivers,
            message: params.message
        }
    })
}

export type useVoucherParams = {
    voucherId: string
    authToken: string
    code?: string
}

/**
 * Redeem a voucher — mints the badge to the caller.
 */
export const useVoucher = async ({params, clientMode}: SolaSdkFunctionParams<useVoucherParams>) => {
    return await request<Badge>(`/vouchers/${params.voucherId}/use`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {code: params.code}
    })
}

/**
 * Reveal a voucher's redemption code (sender only).
 */
export const getVoucherCode = async ({params, clientMode}: SolaSdkFunctionParams<{voucherId: string, authToken: string}>) => {
    const data = await request<{voucher_id: string, code: string}>(`/vouchers/${params.voucherId}/code`, {
        clientMode,
        authToken: params.authToken,
        noCache: true
    })
    return data.code
}

/**
 * Reject a badge offered to you (account strategy — zeroes the voucher).
 * NOTE: takes the VOUCHER id; the old SDK mistakenly sent a badge_class id.
 */
export const rejectVoucher = async ({params, clientMode}: SolaSdkFunctionParams<{voucherId: string, authToken: string}>) => {
    await request(`/vouchers/${params.voucherId}/reject_badge`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken
    })
}

/**
 * Revoke a voucher you sent (zeroes its remaining counter).
 */
export const revokeVoucher = async ({params, clientMode}: SolaSdkFunctionParams<{voucherId: string, authToken: string}>) => {
    return await request<Voucher>(`/vouchers/${params.voucherId}/revoke`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken
    })
}
