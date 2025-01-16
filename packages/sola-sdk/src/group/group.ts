import { getGqlClient, getSdkConfig } from "../client"
import {GET_GROUP_DETAIL_BY_HANDLE, GET_PROFILE_GROUP, GET_PROFILE_MEMBERSHIPS} from "./schemas"
import {Group, GroupDetail, GroupWithOwner, MembershipDetail} from "./types"

/**
 * Get group detail by handle
 * @param groupHandle
 */
export const getGroupDetailByHandle = async (groupHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_GROUP_DETAIL_BY_HANDLE,
        variables: { handle: groupHandle }
    })

    if (!response.data.groups || !response.data.groups.length) {
        return null
    }

    return response.data.groups[0] as GroupDetail
}

/**
 * Get groups of profile management and joined by handle
 * @param profileHandle
 */
export const getProfileMemberships = async (profileHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_PROFILE_MEMBERSHIPS,
        variables: { handle:  profileHandle}
    })
    return response.data.memberships as MembershipDetail[]
}

export const getProfileGroup = async (profileHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_PROFILE_GROUP,
        variables: { handle: profileHandle }
    })

    return response.data.groups.map((group: GroupDetail) => {
        return {
            ...group,
            owner: group.memberships[0]!.profile
        }
    }) as GroupWithOwner[]
}

/**
 * Update group
 * @param group
 * @param auth_token
 */

export const updateGroup = async (group: GroupDetail, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...group,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.group as Group
}