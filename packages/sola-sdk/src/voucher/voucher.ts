import {getGqlClient, getSdkConfig} from "../client"
import {GET_VOUCHER_DETAIL_BY_ID, GET_VOUCHER_DETAIL_BY_HANDLE, GET_GROUP_VOUCHER_BY_HANDLE} from "./schemas"
import {type Voucher, VoucherDetail,} from "./types"
import {Badge} from '../badge'
import {checkAndGetProfileByHandlesOrAddresses} from '../uitls'

/**
 * Get voucher by handle
 * @param handle - handle
 */
export const getVoucherByHandle = async (handle: string) => {
    const client = getGqlClient()
    const expiresAt = new Date().toISOString()

    const response = await client.query({
        query: GET_VOUCHER_DETAIL_BY_HANDLE,
        variables: { handle, expires_at: expiresAt }
    })

    return response.data.vouchers as Voucher[]
}

/**
 * Get voucher by id
 * @param id - id
 */
export const getVoucherDetailById = async (id: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_VOUCHER_DETAIL_BY_ID,
        variables: {id}
    })

    return response.data.vouchers[0] as VoucherDetail || null
}


export const getGroupVoucherByHandle = async (groupHandle: string) => {
    const client = getGqlClient()
    const expiresAt = new Date().toISOString()
    const response = await client.query({
        query: GET_GROUP_VOUCHER_BY_HANDLE,
        variables: { handle: groupHandle, now: expiresAt }
    })

    return response.data.vouchers as Voucher[] || null
}


export type SendCodeVoucherParams = {
    badgeClassId: number,
    authToken: string,
    message?: string,
    amount?: number
}

export const sendCodeVoucher = async (params: SendCodeVoucherParams) => {
    const response = await fetch(`${getSdkConfig().api}/voucher/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_class_id: params.badgeClassId,
            auth_token: params.authToken,
            message: params.message,
            counter: params.amount
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.voucher as Voucher
}

export type SendAccountVoucherParams = {
    badgeClassId: number,
    authToken: string,
    message?: string,
    receivers: string[]
}

export const sendAccountVoucher = async ({receivers,message,authToken,badgeClassId}: SendAccountVoucherParams) => {
    const handlesOrAddresses = receivers.filter(item => !item.includes('@'))
    await checkAndGetProfileByHandlesOrAddresses(handlesOrAddresses)

    const response = await fetch(`${getSdkConfig().api}/voucher/send_badge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_class_id: badgeClassId,
            auth_token: authToken,
            receivers,
            message
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.vouchers as Voucher[]
}

export type useVoucherParams = {
    voucherId: number
    authToken: string
    code?: string
}

export const useVoucher = async (params: useVoucherParams) => {
    const response = await fetch(`${getSdkConfig().api}/voucher/use`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: params.voucherId,
            auth_token: params.authToken,
            code: Number(params.code)
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.badge as Badge
}

export const getVoucherCode = async (voucherId: number, authToken: string) => {
    const response = await fetch(`${getSdkConfig().api}/voucher/get_code?id=${voucherId}&auth_token=${authToken}`, {
        method: 'GET',
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.code as string
}

export const rejectVoucher = async (badgeClassId: number, authToken: string) => {
    const response = await fetch(`${getSdkConfig().api}/voucher/reject_badge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: badgeClassId,
            auth_token: authToken,
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }
}


