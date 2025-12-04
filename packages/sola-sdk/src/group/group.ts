import {ClientMode, getGqlClient, getSdkConfig} from "../client"
import {
    GET_AVAILABLE_GROUPS_FOR_BADGE_CLASS_CREATOR, GET_AVAILABLE_GROUPS_FOR_EVENT_HOST, GET_EVENT_GROUPS,
    GET_GROUP_DETAIL_BY_HANDLE, GET_GROUP_DETAIL_BY_ID,
    GET_MEMBERSHIP_BY_GROUP_ID,
    GET_PROFILE_GROUP,
    GET_PROFILE_MEMBERSHIPS
} from "./schemas"
import {Group, GroupDetail, GroupWithOwner, MembershipDetail} from "./types"
import {InviteDetail} from '../badge/types'
import {checkAndGetProfileByHandlesOrAddresses} from '../uitls'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get group detail by handle
 * @param groupHandle
 * @param clientMode
 */
export const getGroupDetailByHandle = async ({params: {groupHandle}, clientMode}:SolaSdkFunctionParams<{groupHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_GROUP_DETAIL_BY_HANDLE,
        variables: {handle: groupHandle}
    })

    if (!response.data.groups || !response.data.groups.length) {
        return null
    }

    return response.data.groups[0] as GroupDetail
}

export const getGroupDetailById = async ({params: {groupId}}: SolaSdkFunctionParams<{groupId: number}>) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_GROUP_DETAIL_BY_ID,
        variables: {id: groupId}
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
export const getProfileMemberships = async ({params: {profileHandle}, clientMode}: SolaSdkFunctionParams<{profileHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_PROFILE_MEMBERSHIPS,
        variables: {handle: profileHandle}
    })
    return response.data.memberships as MembershipDetail[]
}

export const getProfileGroup = async ({params: {profileHandle}, clientMode}:SolaSdkFunctionParams<{profileHandle: string}>) => {
    const client = getGqlClient(clientMode)
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

export const updateGroup = async ({params: {group, authToken}, clientMode}:SolaSdkFunctionParams<{group: GroupDetail, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: group.id,
            auth_token: authToken,
            group
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
 * @param auth_token
 */

export const removeMember = async ({params, clientMode}: SolaSdkFunctionParams<{profileId: number, groupId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/remove_member`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: params.profileId,
            group_id: params.groupId,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error('Remove member failed')
    }
}

export const removeManager = async ({params, clientMode}: SolaSdkFunctionParams<{profileId: number, groupId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/remove_manager`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: params.profileId,
            group_id: params.groupId,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error('Remove member failed')
    }
}

export const addManager = async ({params, clientMode}:SolaSdkFunctionParams<{profileId: number, groupId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/add_manager`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: params.profileId,
            group_id: params.groupId,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error('Add manager failed')
    }
}

export const freezeGroup = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/freeze_group`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: params.groupId,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error('Freeze group failed')
    }
}

export const transferGroup = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: number, newOwnerHandle: string, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/transfer_owner`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: params.groupId,
            new_owner_handle: params.newOwnerHandle,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error(`Transfer group failed code: ${response.status}`)
    }
}

export const leaveGroup = async ({params, clientMode}:SolaSdkFunctionParams<{profileId: number, groupId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile_id: params.profileId,
            group_id: params.groupId,
            auth_token: params.authToken
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

export const getMembershipByGroupId = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_MEMBERSHIP_BY_GROUP_ID,
        variables: {id: params.groupId}
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
    {params, clientMode}: SolaSdkFunctionParams<{groupId: number,
        receivers: string[],
        role: string,
        message: string,
        authToken: string,}>
) => {
    const handlesOrAddresses = params.receivers.filter(item => !item.includes('@'))
    const {handleResult, addressResult} = await checkAndGetProfileByHandlesOrAddresses(handlesOrAddresses)

    const memberShips = await getMembershipByGroupId({params: {groupId: params.groupId}, clientMode})
    const handleHasJoined = memberShips.find(h => handleResult.some(m => m.handle === h.profile.handle))
    if (handleHasJoined && handleHasJoined.role === params.role) {
        throw new Error(`Profile [${handleHasJoined.profile.handle}] has joined`)
    }

    const addressHasJoined = memberShips.find(a => addressResult.some(m => m.address === a.profile.address))
    if (addressHasJoined && addressHasJoined.role === params.role) {
        throw new Error(`Profile [${addressHasJoined.profile.address}] has joined`)
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/group/send_invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: params.groupId,
            receivers: params.receivers,
            auth_token: params.authToken,
            message: params.message,
            role: params.role
        })
    })

    if (!response.ok) {
        throw new Error(`Send invite failed code: ${response.status}`)
    }
}

export const acceptInvite = async ({params, clientMode}:SolaSdkFunctionParams<{inviteId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/accept_invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_invite_id: params.inviteId,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error(`Accept invite failed code: ${response.status}`)
    }
}

export const rejectInvite = async ({params, clientMode}:SolaSdkFunctionParams<{inviteId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/cancel_invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_invite_id: params.inviteId,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error(`Reject invite failed code: ${response.status}`)
    }
}

export const getAvailableGroupsForBadgeClassCreator = async ({params, clientMode}: SolaSdkFunctionParams<{profileHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_AVAILABLE_GROUPS_FOR_BADGE_CLASS_CREATOR,
        variables: {handle: params.profileHandle}
    })

    return response.data.groups as Group[]
}

export const getEventGroups = async ({clientMode}: {clientMode?: ClientMode}) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_EVENT_GROUPS,
    })

    return response.data.groups as Group[]
}

export const getAvailableGroupsForEventHost = async ({params, clientMode}:SolaSdkFunctionParams<{profileHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_AVAILABLE_GROUPS_FOR_EVENT_HOST,
        variables: {handle: params.profileHandle}
    })

    return response.data.groups as Group[]
}

export const createGroup = async ({params, clientMode}: SolaSdkFunctionParams<{handle: string, authToken: string}>) => {
    const paraams = {
        auth_token: params.authToken,
        handle: params.handle
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/group/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paraams)
    })

    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Create group failed')
    }

    const data = await response.json()
    return data.group as Group
}

/**
 * Send invite with code
 * @param groupId - group id
 * @param role - supported roles: member, manager, owner, issuer
 * @param message - optional invite message
 * @param authToken - auth token
 */
export const sendCodeInvite = async (
    {params, clientMode}: SolaSdkFunctionParams<{
        groupId: number,
        role: string,
        message?: string,
        authToken: string,
    }>
) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/send_invite_with_code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_id: params.groupId,
            role: params.role,
            message: params.message,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Send code invite failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.group_invite as InviteDetail
}

/**
 * Accept invite with code
 * @param groupInviteId - group invite id
 * @param code - invite code
 * @param authToken - auth token
 */
export const acceptCodeInvite = async (
    {params, clientMode}: SolaSdkFunctionParams<{
        groupInviteId: number,
        code: string,
        authToken: string,
    }>
) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/accept_invite_with_code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            group_invite_id: params.groupInviteId,
            code: params.code,
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Accept code invite failed code: ${response.status}`)
    }

    const data = await response.json()
    return data.result as string
}

