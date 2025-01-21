import {getGqlClient, getSdkConfig} from "../client"
import {
    GET_AVAILABLE_BADGE_CLASS_CREATOR_GROUPS,
    GET_GROUP_DETAIL_BY_HANDLE,
    GET_MEMBERSHIP_BY_GROUP_ID,
    GET_PROFILE_GROUP,
    GET_PROFILE_MEMBERSHIPS
} from "./schemas"
import {Group, GroupDetail, GroupWithOwner, MembershipDetail} from "./types"
import {checkAndGetProfileByHandlesOrAddresses} from '../uitls'

/**
 * Get group detail by handle
 * @param groupHandle
 */
export const getGroupDetailByHandle = async (groupHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_GROUP_DETAIL_BY_HANDLE,
        variables: {handle: groupHandle}
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
        variables: {handle: profileHandle}
    })
    return response.data.memberships as MembershipDetail[]
}

export const getProfileGroup = async (profileHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_PROFILE_GROUP,
        variables: {handle: profileHandle}
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

/**
 * Remove Member
 * @param profileId - profile id
 * @param groupId - group id
 */

export const removeMember = async (profileId: number, groupId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/remove_member`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: profileId,
            group_id: groupId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Remove member failed')
    }
}

export const removeManager = async (profileId: number, groupId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/remove_manager`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: profileId,
            group_id: groupId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Remove member failed')
    }
}

export const addManager = async (profileId: number, groupId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/add_manager`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: profileId,
            group_id: groupId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Add manager failed')
    }
}

export const freezeGroup = async (groupId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/freeze_group`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: groupId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Freeze group failed')
    }
}

export const transferGroup = async (groupId: number, newOwnerHandle: string, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/transfer_owner`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: groupId,
            new_owner_handle: newOwnerHandle,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error(`Transfer group failed code: ${response.status}`)
    }
}

export const leaveGroup = async (profileId: number, groupId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: profileId,
            group_id: groupId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error(`Leave group failed code: ${response.status}`)
    }
}

/**
 * Get membership by group id
 * @param groupId
 */

export const getMembershipByGroupId = async (groupId: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_MEMBERSHIP_BY_GROUP_ID,
        variables: {id: groupId}
    })

    return response.data.memberships as MembershipDetail[]
}

/**
 * Send invite
 * @param groupId - group id
 * @param receivers - receivers, supported address, email and handle
 * @param role - supported roles: member, manager, owner, issuer
 * @param message - invite message
 * @param auth_token - auth token
 */

export const sendInvite = async (
    groupId: number,
    receivers: string[],
    role: string,
    message: string,
    auth_token: string,
) => {
    const handlesOrAddresses = receivers.filter(item => !item.includes('@'))
    const {handleResult, addressResult} = await checkAndGetProfileByHandlesOrAddresses(handlesOrAddresses)

    const memberShips = await getMembershipByGroupId(groupId)
    const handleHasJoined = memberShips.find(h => handleResult.some(m => m.handle === h.profile.handle))
    if (handleHasJoined && handleHasJoined.role === role) {
        throw new Error(`Profile [${handleHasJoined.profile.handle}] has joined`)
    }

    const addressHasJoined = memberShips.find(a => addressResult.some(m => m.address === a.profile.address))
    if (addressHasJoined && addressHasJoined.role === role) {
        throw new Error(`Profile [${addressHasJoined.profile.address}] has joined`)
    }

    const response = await fetch(`${getSdkConfig().api}/group/send_invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: groupId,
            receivers,
            auth_token,
            message,
            role
        })
    })

    if (!response.ok) {
        throw new Error(`Send invite failed code: ${response.status}`)
    }
}

export const acceptInvite = async (inviteId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/accept_invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_invite_id: inviteId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error(`Accept invite failed code: ${response.status}`)
    }
}

export const rejectInvite = async (inviteId: number, auth_token: string) => {
    const response = await fetch(`${getSdkConfig().api}/group/cancel_invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_invite_id: inviteId,
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error(`Reject invite failed code: ${response.status}`)
    }
}

export const getAvailableBadgeClassCreatorGroups = async (profileHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_AVAILABLE_BADGE_CLASS_CREATOR_GROUPS,
        variables: {handle: profileHandle}
    })

    return response.data.groups as Group[]
}

