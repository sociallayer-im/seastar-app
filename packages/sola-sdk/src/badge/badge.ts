import {getGqlClient, getSdkConfig} from "../client"
import {
    GET_BADGE_BY_OWNER_HANDLE,
    GET_BADGE_CLASS_BY_OWNER_HANDLE,
    GET_BADGE_AND_BADGE_CLASS_BY_OWNER_HANDLE,
    GET_BADGE_CLASS_DETAIL_BY_BADGE_CLASS_ID,
    GET_BADGE_DETAIL_BY_BADGE_ID,
    GET_BADGE_CLASS_AND_INVITE_BY_HANDLE,
    GET_INVITE_DETAIL_BY_ID
} from "./schemas"
import {BadgeDetail, Badge, BadgeClassDetail, Invite, InviteDetail, BadgeClass} from "./types"

/**
 * Get badge detail by owner handle
 * @param handle - owner handle
 */
export const getBadgeDetailByOwnerHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_BADGE_BY_OWNER_HANDLE,
        variables: {handle}
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
export const getBadgeClassDetailByOwnerHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_BADGE_CLASS_BY_OWNER_HANDLE,
        variables: {handle}
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
export const getBadgeAndBadgeClassByOwnerHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_BADGE_AND_BADGE_CLASS_BY_OWNER_HANDLE,
        variables: {handle}
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

export const getBadgeClassDetailByBadgeClassId = async (badgeClassId: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_BADGE_CLASS_DETAIL_BY_BADGE_CLASS_ID,
        variables: {id: badgeClassId}
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

export const getBadgeDetailByBadgeId = async (badgeId: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_BADGE_DETAIL_BY_BADGE_ID,
        variables: {id: badgeId}
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

export const getBadgeClassAndInviteByHandle = async (groupHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_BADGE_CLASS_AND_INVITE_BY_HANDLE,
        variables: {handle: groupHandle, now: new Date().toISOString()}
    })

    return {
        badgeClasses: response.data.badge_classes as BadgeClassDetail[],
        groupInvites: response.data.group_invites as Invite[]
    }
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
export const createBadgeClass = async (props: { badgeClass: BadgeClass, authToken: string }) => {
    const response = await fetch(`${getSdkConfig().api}/badge_class/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            badge_class: props.badgeClass,
            auth_token: props.authToken
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