import {ClientMode, getSdkConfig} from './client'
import {SolaSdkFunctionParams} from './types'
import {Voucher} from './voucher'
import {Activity, ActivityDetail} from './activity'
import {BadgeClass} from './badge'
import {Profile} from './profile'

export const cancelJoinRemember = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    voucherId: number
}>) => {
    return await fetch(`${getSdkConfig(clientMode).api}/remember/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            voucher_id: params.voucherId,
            auth_token: params.authToken
        })
    })
}

export const createRememberVoucher = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    badgeClassId: number
}>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/remember/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_class_id: params.badgeClassId,
            auth_token: params.authToken
        })
    })

    const data = await res.json()

    return data.voucher as Voucher
}

export const getJoinedRemember = async ({params, clientMode}: SolaSdkFunctionParams<{ voucherId: number }>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/remember/get?voucher_id=${params.voucherId}`)

    const data = await res.json()

    return data as {
        activities: ActivityDetail[],
        voucher: Voucher,
        badge_class: BadgeClass
    }
}

export const getRememberMetadata = async ({clientMode}: { clientMode: ClientMode }) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/remember/meta`)
    const data = await res.json()

    return data.types[0] as {
        "path": string,
        "badge_class_id": number,
        "count": number,
        "description": string
    } | undefined
}

export const getUserPopupcitys = async ({params, clientMode}: SolaSdkFunctionParams<{ ids: number[] }>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/service/get_user_related_groups?profile_ids=${params.ids.join(',')}`)
    const data = await res.json()


    return data.group_data as {
        [index: string]: {
            groups: { id: number, handle: string, image_url: null | string }[]
        }
    }
}

export const joinRemember = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    voucherId: number
}>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/remember/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            voucher_id: params.voucherId,
            auth_token: params.authToken
        })
    })
    const data = await res.json()

    return data as {
        activity: Activity,
        sender: Profile
    }
}

export const mintRemember = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    voucherId: number
}>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/remember/mint`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            voucher_id: params.voucherId,
            auth_token: params.authToken
        })
    })

    const data = await res.json()
    return data.badge_class as BadgeClass
}