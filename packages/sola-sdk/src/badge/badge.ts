import {getSdkConfig} from "../client"
import {BadgeDetail, Badge, BadgeClassDetail, Invite, InviteDetail, BadgeClass} from "./types"
import {SolaSdkFunctionParams} from '../types'

export const getBadgeDetailByOwnerHandle = async ({params, clientMode} : SolaSdkFunctionParams<{handle: string}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge/list?owner_handle=${encodeURIComponent(params.handle)}&status=accepted`)
    const data = await resp.json()

    if (!data.badges || !data.badges.length) {
        return null
    }

    return data.badges[0] as BadgeDetail
}

export const getBadgeClassDetailByOwnerHandle = async ({params, clientMode} : SolaSdkFunctionParams<{ handle: string }>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge_class/list?creator_handle=${encodeURIComponent(params.handle)}&status=accepted`)
    const data = await resp.json()

    if (!data.badge_classes || !data.badge_classes.length) {
        return null
    }

    return data.badge_classes[0] as BadgeClassDetail
}

export const getBadgeAndBadgeClassByOwnerHandle = async ({params, clientMode} : SolaSdkFunctionParams<{ handle: string }>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const [badgesResp, badgeClassesResp] = await Promise.all([
        fetch(`${apiUrl}/badge/list?owner_handle=${encodeURIComponent(params.handle)}&status=accepted,minted`),
        fetch(`${apiUrl}/badge_class/list?creator_handle=${encodeURIComponent(params.handle)}`)
    ])
    const badgesData = await badgesResp.json()
    const badgeClassesData = await badgeClassesResp.json()

    return {
        badges: (badgesData.badges || []) as Badge[],
        badgeClasses: (badgeClassesData.badge_classes || []) as BadgeClassDetail[]
    }
}

export const getBadgeClassDetailByBadgeClassId = async ({params, clientMode}: SolaSdkFunctionParams<{badgeClassId: number}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge_class/get?id=${params.badgeClassId}`)
    const data = await resp.json()

    if (!data.badge_class) {
        return null
    }

    return data.badge_class as BadgeClassDetail
}

export const getBadgeDetailByBadgeId = async ({params, clientMode}: SolaSdkFunctionParams<{badgeId: number}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge/get?id=${params.badgeId}`)
    const data = await resp.json()

    if (!data.badge) {
        return null
    }

    return data.badge as BadgeDetail
}

export const getBadgeClassAndInviteByGroupHandle = async ({params, clientMode}: SolaSdkFunctionParams<{groupHandle: string}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge_class/invites?group_handle=${encodeURIComponent(params.groupHandle)}`)
    const data = await resp.json()

    return {
        badgeClasses: (data.badge_classes || []) as BadgeClassDetail[],
        groupInvites: (data.invites || []) as Invite[]
    }
}

export const getBadgeClassByGroupId = async ({params, clientMode}:SolaSdkFunctionParams<{groupId: number}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge_class/list?group_id=${params.groupId}`)
    const data = await resp.json()

    return (data.badge_classes || []) as BadgeClassDetail[]
}

export const getInviteDetailByInviteId = async (inviteId: number) => {
    const apiUrl = getSdkConfig().api
    const resp = await fetch(`${apiUrl}/group_invite/get?id=${inviteId}`, {cache: 'no-store'})
    const data = await resp.json()

    if (!data.group_invite) {
        return null
    }

    return data.group_invite as InviteDetail
}

export const createBadgeClass = async ({params, clientMode}:SolaSdkFunctionParams<{badgeClass: BadgeClass, authToken: string }>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/badge_class/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...params.badgeClass,
            id:undefined,
            name: params.badgeClass.title,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()

    if (!data.badge_class) {
        throw new Error(`create badge class failed`)
    }

    return data.badge_class as BadgeClass
}

export const checkBadgeOwnership = async ({params, clientMode}: SolaSdkFunctionParams<{badgeId: number, handle: string}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/badge/list?owner_handle=${encodeURIComponent(params.handle)}&badge_class_id=${params.badgeId}`)
    const data = await resp.json()

    return (data.badges || []).length > 0
}

export async function swapBadge({clientMode, params}: SolaSdkFunctionParams<{ authToken: string, badgeId: number, swapToken: string }>) {
  const res = await fetch(`${getSdkConfig(clientMode).api}/badge/swap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_id: params.badgeId,
            auth_token: params.authToken,
            swap_token: params.swapToken
        })
    })

    if(!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to swap badge')
    }
}

export async function getSwapCode({params, clientMode}: SolaSdkFunctionParams<{ authToken: string, badgeId: number }>) {
   const response = await fetch(`${getSdkConfig(clientMode).api}/badge/swap_code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_id: params.badgeId,
            auth_token: params.authToken,
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.token as string
}
