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
 * A group's pending (non-expired) invites, via any one of its badge classes —
 * GroupInvite is a group-level relation, so the badge_class chosen to hang the
 * request off doesn't matter. Manager-only: 403s for non-managers, so callers
 * without authToken (or without manage rights) should treat a thrown error as
 * "no invites visible to me", not "the group has none".
 */
export const getGroupInvitesViaBadgeClass = async ({params, clientMode}: SolaSdkFunctionParams<{badgeClassId: string, authToken: string}>) => {
    const data = await request<{badge_class: BadgeClass, invites: Invite[]}>(`/badge_classes/${params.badgeClassId}/invites`, {
        clientMode,
        authToken: params.authToken
    })
    return data.invites
}

/**
 * Badge classes of a group, plus its pending invites (manager-only — requires
 * authToken; falls back to an empty list for anonymous/non-manager callers).
 */
export const getBadgeClassAndInviteByGroupName = async ({params, clientMode}: SolaSdkFunctionParams<{groupName: string, authToken?: string}>) => {
    const badgeClasses = await getBadgeClassesByGroupName({params, clientMode})
    if (!params.authToken || !badgeClasses.length) {
        return {badgeClasses, groupInvites: [] as Invite[]}
    }
    try {
        const groupInvites = await getGroupInvitesViaBadgeClass({
            params: {badgeClassId: badgeClasses[0]!.id, authToken: params.authToken},
            clientMode
        })
        return {badgeClasses, groupInvites}
    } catch {
        return {badgeClasses, groupInvites: [] as Invite[]}
    }
}

/**
 * A single invite by id — powers the /invite/:id preview/accept page. Covers
 * BOTH email invites and reusable code invites (the previous implementation
 * only listed the current user's `pending_for_email` invites, which never
 * includes code invites — receiver_address_type "code" isn't an email match —
 * so a code-invite link 404'd for every recipient). See
 * GroupInvitePolicy#view? on the backend for who may fetch what.
 */
export const getInviteDetailByInviteId = async ({params, clientMode}: SolaSdkFunctionParams<{inviteId: string, authToken: string}>) => {
    return await requestOrNull<Invite>(`/group_invites/${params.inviteId}`, {
        clientMode,
        authToken: params.authToken,
        noCache: true
    })
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
 * @param target - recipient's username. Unlike voucher sending, the backend
 * (BadgesController#transfer) resolves the target ONLY by User.find_by(name:) —
 * an eth address or email will not match and the request fails.
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
