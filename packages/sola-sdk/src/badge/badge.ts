import {ClientMode, getGqlClient, getSdkConfig} from "../client"
import {
    GET_BADGE_BY_OWNER_HANDLE,
    GET_BADGE_CLASS_BY_OWNER_HANDLE,
    GET_BADGE_AND_BADGE_CLASS_BY_OWNER_HANDLE,
    GET_BADGE_CLASS_DETAIL_BY_BADGE_CLASS_ID,
    GET_BADGE_DETAIL_BY_BADGE_ID,
    GET_INVITE_DETAIL_BY_ID,
    GET_BADGE_CLASS_BY_GROUP_ID,
    GET_BADGE_CLASS_AND_INVITE_BY_GROUP_HANDLE,
    CHECK_BADGE_OWNERSHIP
} from "./schemas"
import {BadgeDetail, Badge, BadgeClassDetail, Invite, InviteDetail, BadgeClass} from "./types"
import {SolaSdkFunctionParams} from '../types'

/**
 * Get badge detail by owner handle
 * @param handle - owner handle
 */
export const getBadgeDetailByOwnerHandle = async ({params, clientMode} : SolaSdkFunctionParams<{handle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_BY_OWNER_HANDLE,
        variables: {handle: params.handle}
    })

    if (!response.data.badges || !response.data.badges.length) {
        return null
    }

    return response.data.badges[0] as BadgeDetail
}

/**
 * Get badge class detail by owner handle
 * @param handle - owner handle
 */
export const getBadgeClassDetailByOwnerHandle = async ({params, clientMode} : SolaSdkFunctionParams<{ handle: string }>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_CLASS_BY_OWNER_HANDLE,
        variables: {handle: params.handle}
    })

    if (!response.data.badge_classes || !response.data.badge_classes.length) {
        return null
    }

    return response.data.badge_classes[0] as BadgeClassDetail
}

/**
 * Get badge and badge class detail by owner handle
 * @param handle - owner handle
 */
export const getBadgeAndBadgeClassByOwnerHandle = async ({params, clientMode} : SolaSdkFunctionParams<{ handle: string }>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_AND_BADGE_CLASS_BY_OWNER_HANDLE,
        variables: {handle: params.handle}
    })

    return {
        badges: response.data.badges as Badge[],
        badgeClasses: response.data.badge_classes as BadgeClassDetail[]
    }
}

/**
 * Get badge class detail by badge class id
 * @param badgeClassId - badge class id
 */

export const getBadgeClassDetailByBadgeClassId = async ({params, clientMode}: SolaSdkFunctionParams<{badgeClassId: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_CLASS_DETAIL_BY_BADGE_CLASS_ID,
        variables: {id: params.badgeClassId}
    })

    if (!response.data.badge_classes || !response.data.badge_classes.length) {
        return null
    }

    return response.data.badge_classes[0] as BadgeClassDetail
}

/**
 * Get badge detail by badge id
 * @param badgeId - badge id
 */

export const getBadgeDetailByBadgeId = async ({params, clientMode}: SolaSdkFunctionParams<{badgeId: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_DETAIL_BY_BADGE_ID,
        variables: {id: params.badgeId}
    })

    if (!response.data.badges || !response.data.badges.length) {
        return null
    }

    return response.data.badges[0] as BadgeDetail
}

/**
 * Get badge class and invite by handle
 * @param groupHandle - group handle
 */

export const getBadgeClassAndInviteByGroupHandle = async ({params, clientMode}: SolaSdkFunctionParams<{groupHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_CLASS_AND_INVITE_BY_GROUP_HANDLE,
        variables: {handle: params.groupHandle, now: new Date().toISOString()}
    })

    console.log('response.data.group_invites', response.data.group_invites)

    return {
        badgeClasses: response.data.badge_classes as BadgeClassDetail[],
        groupInvites: response.data.group_invites as Invite[]
    }
}


/**
 * Get badge class by group id
 * @param groupId
 */

export const getBadgeClassByGroupId = async ({params, clientMode}:SolaSdkFunctionParams<{groupId: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_BADGE_CLASS_BY_GROUP_ID,
        variables: {id: params.groupId}
    })

    return response.data.badge_classes as BadgeClassDetail[]
}

/**
 * Get invite detail by invite id
 * @param inviteId - invite id
 */

export const getInviteDetailByInviteId = async (inviteId: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_INVITE_DETAIL_BY_ID,
        variables: {id: inviteId}
    })

    if (!response.data.group_invites || !response.data.group_invites.length) {
        return null
    }

    return response.data.group_invites[0] as InviteDetail
}

/**
 * Create badge class
 * @param props.badgeClass - badge class detail
 * @param props.authToken - auth token
 */
export const createBadgeClass = async ({params, clientMode}:SolaSdkFunctionParams<{badgeClass: BadgeClass, authToken: string }>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/badge_class/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_class: params.badgeClass,
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
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: CHECK_BADGE_OWNERSHIP,
        variables: {badgeId: params.badgeId, handle: params.handle}
    })

    return response.data.badges.length > 0
}