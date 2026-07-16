import {ClientMode} from './client'
import {request} from './request'
import {SolaSdkFunctionParams} from './types'
import {Voucher} from './voucher'
import {BadgeClass, Badge} from './badge'
import {Profile} from './profile'
import {Group} from './group'

/**
 * A remember/join roster entry — the activity carries who joined.
 */
export interface RememberActivity {
    id: string
    action: string
    created_at: string
    initiator: Profile
}

export interface RememberPayload {
    voucher: Voucher
    badge_class: BadgeClass
    activities: RememberActivity[]
}

/**
 * Create a remember voucher (the creator is auto-joined)
 */
export const createRememberVoucher = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    badgeClassId: string,
    message?: string
}>) => {
    const data = await request<RememberPayload>('/remember', {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {badge_class_id: params.badgeClassId, message: params.message}
    })
    return data.voucher
}

/**
 * Poll the join roster (public). voucher.counter === 0 means already minted.
 */
export const getJoinedRemember = async ({params, clientMode}: SolaSdkFunctionParams<{ voucherId: string }>) => {
    return await request<RememberPayload>(`/remember/${encodeURIComponent(params.voucherId)}`, {
        clientMode,
        noCache: true
    })
}

export const joinRemember = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    voucherId: string
}>) => {
    return await request<RememberPayload>(`/remember/${params.voucherId}/join`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken
    })
}

export const cancelJoinRemember = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    voucherId: string
}>) => {
    await request(`/remember/${params.voucherId}/cancel`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken
    })
}

/**
 * Mint the shared badge — creator only, one badge per joiner
 */
export const mintRemember = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    voucherId: string
}>) => {
    const data = await request<{voucher: Voucher, badge_class: BadgeClass, badges: Badge[]}>(
        `/remember/${params.voucherId}/mint`,
        {method: 'POST', clientMode, authToken: params.authToken}
    )
    return data.badge_class
}

/**
 * Client config: which badge class remember badges mint from, joiner threshold
 */
export const getRememberMetadata = async ({clientMode}: { clientMode: ClientMode }) => {
    const data = await request<{types: {path: string, badge_class_id: string, count: number}[]}>(
        '/remember/meta', {clientMode}
    )
    return data.types[0]
}

/**
 * Popup-city groups each user attended — decorates the join roster avatars
 */
export const getUserPopupcitys = async ({params, clientMode}: SolaSdkFunctionParams<{ ids: string[] }>) => {
    const data = await request<{
        group_data: {
            [userId: string]: {
                name: string,
                groups: Group[]
            }
        }
    }>('/remember/related_groups', {clientMode, params: {user_ids: params.ids.join(',')}})

    return data.group_data
}
