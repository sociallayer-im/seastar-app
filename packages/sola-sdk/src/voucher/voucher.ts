import {getGqlClient, getSdkConfig} from "../client"
import {GET_VOUCHER_DETAIL_BY_ID, GET_VOUCHER_DETAIL_BY_HANDLE, GET_GROUP_VOUCHER_BY_HANDLE} from "./schemas"
import {type Voucher, VoucherDetail,} from "./types"
import {Badge} from '../badge'
import {checkAndGetProfileByHandlesOrAddresses, fixDate} from '../uitls'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get voucher by handle
 * @param handle - handle
 */
export const getVoucherByHandle = async ({params, clientMode}:SolaSdkFunctionParams<{handle: string}>) => {
    const client = getGqlClient(clientMode)
    const expiresAt = new Date().toISOString()

    const response = await client.query({
        query: GET_VOUCHER_DETAIL_BY_HANDLE,
        variables: { handle: params.handle, expires_at: expiresAt }
    })

    return response.data.vouchers.map((v:Voucher) => fixDate(v)) as Voucher[]
}

/**
 * Get voucher by id
 * @param id - id
 */
export const getVoucherDetailById = async ({params, clientMode}: SolaSdkFunctionParams<{id: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_VOUCHER_DETAIL_BY_ID,
        variables: {id: params.id}
    })

    return response.data.vouchers[0] ? fixDate(response.data.vouchers[0]) as VoucherDetail : null
}


export const getGroupVoucherByHandle = async ({params, clientMode}: SolaSdkFunctionParams<{groupHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const expiresAt = new Date().toISOString()
    const response = await client.query({
        query: GET_GROUP_VOUCHER_BY_HANDLE,
        variables: { handle: params.groupHandle, now: expiresAt }
    })

    return response.data.vouchers.map((v:Voucher) => fixDate(v)) as Voucher[]
}


export type SendCodeVoucherParams = {
    badgeClassId: number,
    authToken: string,
    message?: string,
    amount?: number
}

export const sendCodeVoucher = async ({params, clientMode}:SolaSdkFunctionParams<SendCodeVoucherParams>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/voucher/create`, {
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

export const sendAccountVoucher = async ({params: {receivers,message,authToken,badgeClassId}, clientMode}: SolaSdkFunctionParams<SendAccountVoucherParams>) => {
    const handlesOrAddresses = receivers.filter(item => !item.includes('@'))
    await checkAndGetProfileByHandlesOrAddresses(handlesOrAddresses)

    const response = await fetch(`${getSdkConfig(clientMode).api}/voucher/send_badge`, {
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

export const useVoucher = async ({params, clientMode}: SolaSdkFunctionParams<useVoucherParams>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/voucher/use`, {
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

export const getVoucherCode = async ({params, clientMode}: SolaSdkFunctionParams<{voucherId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/voucher/get_code?id=${params.voucherId}&auth_token=${params.authToken}`, {
        method: 'GET',
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.code as string
}

export const rejectVoucher = async ({params, clientMode}:SolaSdkFunctionParams<{badgeClassId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/voucher/reject_badge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: params.badgeClassId,
            auth_token: params.authToken,
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


