import {request, requestOrNull, Paginated} from '../request'
import {Badge, BadgeClass, Invite} from './types'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get badges owned by a user (soon returns minted badges only)
 * @param name - owner's username
 */
export const getBadgesByOwnerName = async ({params, clientMode}: SolaSdkFunctionParams<{name: string}>) => {
    const res = await request<Paginated<Badge>>('/badges', {
        clientMode,
        params: {owner_handle: params.name}
    })
    return res.data
}

/**
 * Get badge detail by id
 */
export const getBadgeDetailByBadgeId = async ({params, clientMode}: SolaSdkFunctionParams<{badgeId: string}>) => {
    return await requestOrNull<Badge>(`/badges/${params.badgeId}`, {clientMode})
}

/**
 * Get badge classes created by a user
 * @param name - creator's username
 */
export const getBadgeClassesByCreatorName = async ({params, clientMode}: SolaSdkFunctionParams<{name: string}>) => {
    const res = await request<Paginated<BadgeClass>>('/badge_classes', {
        clientMode,
        params: {creator_handle: params.name}
    })
    return res.data
}

/**
 * Get badge classes of a group by group name
 */
export const getBadgeClassesByGroupName = async ({params, clientMode}: SolaSdkFunctionParams<{groupName: string}>) => {
    const res = await request<Paginated<BadgeClass>>('/badge_classes', {
        clientMode,
        params: {group_handle: params.groupName}
    })
    return res.data
}

/**
 * Get badge classes of a group by group id
 */
export const getBadgeClassByGroupId = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: string}>) => {
    const res = await request<Paginated<BadgeClass>>('/badge_classes', {
        clientMode,
        params: {group_id: params.groupId}
    })
    return res.data
}

/**
 * Get badge class detail by id
 */
export const getBadgeClassDetailByBadgeClassId = async ({params, clientMode}: SolaSdkFunctionParams<{badgeClassId: string}>) => {
    return await requestOrNull<BadgeClass>(`/badge_classes/${params.badgeClassId}`, {clientMode})
}

/**
 * Badge classes a user can send — bare array endpoint.
 * @param name - username
 */
export const getBadgeClassesByUser = async ({params, clientMode}: SolaSdkFunctionParams<{name: string}>) => {
    return await request<BadgeClass[]>('/badge_classes/by_user', {
        clientMode,
        params: {handle: params.name}
    })
}

/**
 * Badges owned by + badge classes created by a user, for the profile page.
 */
export const getBadgeAndBadgeClassByOwnerName = async ({params, clientMode}: SolaSdkFunctionParams<{name: string}>) => {
    const [badges, badgeClasses] = await Promise.all([
        getBadgesByOwnerName({params, clientMode}),
        getBadgeClassesByCreatorName({params, clientMode})
    ])
    return {badges, badgeClasses}
}

/**
 * Badge classes of a group. NOTE: soon does not expose a group's pending
 * invites publicly (sails' badge_class/invites did) — groupInvites is always
 * empty; the invite flow reads GET /group_invites/pending instead.
 */
export const getBadgeClassAndInviteByGroupName = async ({params, clientMode}: SolaSdkFunctionParams<{groupName: string}>) => {
    const badgeClasses = await getBadgeClassesByGroupName({params, clientMode})
    return {badgeClasses, groupInvites: [] as Invite[]}
}

/**
 * A group invite addressed to the current user, looked up in their pending
 * invites (soon has no standalone invite show endpoint).
 */
export const getInviteDetailByInviteId = async ({params, clientMode}: SolaSdkFunctionParams<{inviteId: string, authToken: string}>) => {
    const invites = await request<Invite[]>('/group_invites/pending', {
        clientMode,
        authToken: params.authToken,
        noCache: true
    })
    return invites.find(i => i.id === params.inviteId) || null
}

/**
 * Create a badge class (name falls back to title, as before).
 */
export const createBadgeClass = async ({params, clientMode}: SolaSdkFunctionParams<{badgeClass: Partial<BadgeClass>, authToken: string}>) => {
    return await request<BadgeClass>('/badge_classes', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {
            badge_class: {
                ...params.badgeClass,
                id: undefined,
                name: params.badgeClass.name || params.badgeClass.title
            }
        }
    })
}

/**
 * Whether a user owns a badge of the given badge class.
 */
export const checkBadgeOwnership = async ({params, clientMode}: SolaSdkFunctionParams<{badgeClassId: string, name: string}>) => {
    const res = await request<Paginated<Badge>>('/badges', {
        clientMode,
        params: {owner_handle: params.name, badge_class_id: params.badgeClassId}
    })
    return res.data.length > 0
}

/**
 * Claim a badge offered via a swap code.
 */
export async function swapBadge({params, clientMode}: SolaSdkFunctionParams<{authToken: string, badgeId: string, swapToken: string}>) {
    await request(`/badges/${params.badgeId}/swap`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {swap_token: params.swapToken}
    })
}

/**
 * Mint a swap code for a badge you own.
 */
export async function getSwapCode({params, clientMode}: SolaSdkFunctionParams<{authToken: string, badgeId: string}>) {
    const data = await request<{result: string, token: string, badge_id: string}>(`/badges/${params.badgeId}/swap_code`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken
    })
    return data.token
}

/**
 * Transfer a badge you own to another user.
 * @param target - recipient's username (eth address / email also accepted)
 */
export async function transferBadge({params, clientMode}: SolaSdkFunctionParams<{authToken: string, badgeId: string, target: string}>) {
    await request(`/badges/${params.badgeId}/transfer`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {target: params.target}
    })
}

/**
 * Burn a badge you own.
 */
export async function burnBadge({params, clientMode}: SolaSdkFunctionParams<{authToken: string, badgeId: string}>) {
    await request(`/badges/${params.badgeId}/burn`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken
    })
}

/**
 * Change a badge's display mode (normal | hidden | pinned).
 */
export async function updateBadgeDisplay({params, clientMode}: SolaSdkFunctionParams<{authToken: string, badgeId: string, display: string}>) {
    return await request<Badge>(`/badges/${params.badgeId}`, {
        clientMode,
        method: 'PATCH',
        authToken: params.authToken,
        body: {display: params.display}
    })
}
