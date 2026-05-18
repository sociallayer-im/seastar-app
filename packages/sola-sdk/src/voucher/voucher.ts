import {getSdkConfig} from "../client"
import {type Voucher, VoucherDetail,} from "./types"
import {Badge} from '../badge'
import {checkAndGetProfileByHandlesOrAddresses, fixDate} from '../uitls'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get voucher by handle
 * @param handle - handle
 */
export const getVoucherByHandle = async ({params, clientMode}:SolaSdkFunctionParams<{handle: string}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/voucher/list?sender_handle=${encodeURIComponent(params.handle)}`)
    const data = await resp.json()
    return (data.vouchers as Voucher[]).map((v:Voucher) => fixDate(v)) as Voucher[]
}

/**
 * Get voucher by id
 * @param id - id
 */
export const getVoucherDetailById = async ({params, clientMode}: SolaSdkFunctionParams<{id: number}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/voucher/get?id=${params.id}`)
    const data = await resp.json()
    return data.voucher ? fixDate(data.voucher) as VoucherDetail : null
}


export const getGroupVoucherByHandle = async ({params, clientMode}: SolaSdkFunctionParams<{groupHandle: string}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/voucher/list?group_handle=${encodeURIComponent(params.groupHandle)}`)
    const data = await resp.json()
    return (data.vouchers as Voucher[]).map((v:Voucher) => fixDate(v)) as Voucher[]
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


