import {ClientMode} from '../client'
import {request, requestOrNull, requestAllPages} from '../request'
import {Community, Group, GroupDetail, GroupWithOwner, Membership, MembershipDetail} from './types'
import {InviteDetail} from '../badge/types'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get group detail by name or id (public, :detail view)
 */
// noCache defaults true (always fresh — most callers read this right after
// an edit). Pass false to allow soon's own Cache-Control (this response never
// personalizes) to govern via the standard fetch cache, not Next.js's.
/**
 * Pass `authToken` whenever the result's member roster will be displayed.
 * The endpoint personalizes one thing — a group's private team badges are
 * rendered only for people in that group — so an anonymous fetch returns the
 * public ones and a member sees an incomplete roster.
 */
export const getGroupDetailByName = async ({params: {groupName, noCache, authToken}, clientMode}: SolaSdkFunctionParams<{groupName: string, noCache?: boolean, authToken?: string}>) => {
    return await requestOrNull<GroupDetail>(`/groups/${encodeURIComponent(groupName)}`, {clientMode, authToken, noCache: noCache ?? true})
}

export const getGroupDetailById = async ({params: {groupId, noCache, authToken}, clientMode}: SolaSdkFunctionParams<{groupId: string, noCache?: boolean, authToken?: string}>) => {
    return await requestOrNull<GroupDetail>(`/groups/${encodeURIComponent(groupId)}`, {clientMode, authToken, noCache: noCache ?? true})
}

/**
 * Get a profile's memberships (public) — each entry carries its group
 * @param profileName
 */
export const getProfileMemberships = async ({params: {profileName}, clientMode}: SolaSdkFunctionParams<{profileName: string}>) => {
    return await request<MembershipDetail[]>(`/users/${encodeURIComponent(profileName)}/groups`, {clientMode})
}

export const getProfileGroup = async ({params: {profileName}, clientMode}: SolaSdkFunctionParams<{profileName: string}>) => {
    const memberships = await request<MembershipDetail[]>(`/users/${encodeURIComponent(profileName)}/groups`, {clientMode})
    return memberships.map(m => ({...m.group, role: m.role})) as GroupWithOwner[]
}

/**
 * Groups a profile can act on as a manager (owner/manager roles)
 */
export const getAvailableGroupsForBadgeClassCreator = async ({params, clientMode}: SolaSdkFunctionParams<{profileName: string}>) => {
    const memberships = await request<MembershipDetail[]>(
        `/users/${encodeURIComponent(params.profileName)}/groups`,
        {clientMode, params: {role: 'owner,manager'}}
    )
    return memberships.map(m => m.group) as Group[]
}

export const getAvailableGroupsForEventHost = async ({params, clientMode}: SolaSdkFunctionParams<{profileName: string}>) => {
    const memberships = await request<MembershipDetail[]>(
        `/users/${encodeURIComponent(params.profileName)}/groups`,
        {clientMode, params: {role: 'owner,manager'}}
    )
    return memberships.map(m => m.group) as Group[]
}

/**
 * Update group
 */
export const updateGroup = async ({params: {group, authToken}, clientMode}: SolaSdkFunctionParams<{group: Partial<GroupDetail> & {id: string}, authToken: string}>) => {
    return await request<Group>(`/groups/${group.id}`, {
        method: 'PATCH',
        clientMode,
        authToken,
        body: {
            group: {
                name: group.name,
                nickname: group.nickname,
                timezone: group.timezone,
                location: group.location,
                start_date: group.start_date,
                end_date: group.end_date,
                bio: group.bio,
                image_url: group.image_url,
                logo_url: group.logo_url,
                parent_id: group.parent_id,
                banner_image_url: group.banner_image_url,
                banner_link_url: group.banner_link_url,
                banner_text: group.banner_text,
                featured_image_url: group.featured_image_url,
                social_links: group.social_links,
                group_tags: group.group_tags,
                event_tag_list: group.event_tag_list,
                requirement_tag_list: group.requirement_tag_list,
                venue_tag_list: group.venue_tag_list,
                can_publish_event: group.can_publish_event,
                can_join_event: group.can_join_event,
                can_view_event: group.can_view_event,
                require_event_approval: group.require_event_approval,
                // Both must be listed here AND in soon's group_params permit
                // list. A field missing from either one is dropped silently —
                // the settings page saves, and the value never lands.
                discussion_enabled: group.discussion_enabled,
                can_post_topic: group.can_post_topic
            }
        }
    })
}

export const createGroup = async ({params, clientMode}: SolaSdkFunctionParams<{groupName: string, authToken: string}>) => {
    return await request<Group>('/groups', {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {group: {name: params.groupName}}
    })
}

/**
 * Freeze (deactivate) a group — owner only
 */
export const freezeGroup = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: string, authToken: string}>) => {
    await request(`/groups/${params.groupId}/freeze`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken
    })
}

/**
 * Get the full member roster of a group (public)
 */
export const getMembershipByGroupId = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: string}>) => {
    return await requestAllPages<Membership>(`/groups/${encodeURIComponent(params.groupId)}/memberships`, {clientMode})
}

/**
 * Membership ops are keyed by membership id — resolve a user's membership first.
 */
const findMembership = async (groupId: string, userId: string, clientMode?: ClientMode) => {
    const memberships = await getMembershipByGroupId({params: {groupId}, clientMode: clientMode!})
    const membership = memberships.find(m => m.user.id === userId)
    if (!membership) {
        throw new Error('Membership not found')
    }
    return membership
}

export const removeMember = async ({params, clientMode}: SolaSdkFunctionParams<{profileId: string, groupId: string, authToken: string}>) => {
    const membership = await findMembership(params.groupId, params.profileId, clientMode)
    await request(`/groups/${params.groupId}/memberships/${membership.id}`, {
        method: 'DELETE',
        clientMode,
        authToken: params.authToken
    })
}

/** Demote a manager back to plain member. */
export const removeManager = async ({params, clientMode}: SolaSdkFunctionParams<{profileId: string, groupId: string, authToken: string}>) => {
    const membership = await findMembership(params.groupId, params.profileId, clientMode)
    await request(`/groups/${params.groupId}/memberships/${membership.id}`, {
        method: 'PATCH',
        clientMode,
        authToken: params.authToken,
        body: {membership: {role: 'member'}}
    })
}

/**
 * Grant the manager role to an EXISTING member. Uses PATCH (role change on
 * their membership), not POST (which requires full `manage?` and 403s for a
 * parent-group manager, who can only toggle the manager role specifically —
 * see GroupPolicy#can_assign_manager?). The one caller (AddManagerForm) only
 * ever offers already-members, so this is safe for the direct-manager case too.
 */
export const addManager = async ({params, clientMode}: SolaSdkFunctionParams<{profileId: string, groupId: string, authToken: string}>) => {
    const membership = await findMembership(params.groupId, params.profileId, clientMode)
    await request(`/groups/${params.groupId}/memberships/${membership.id}`, {
        method: 'PATCH',
        clientMode,
        authToken: params.authToken,
        body: {membership: {role: 'manager'}}
    })
}

/** The tags platform admins use to curate the homepage. */
export type CurationTag = 'pin' | 'top' | 'featured'

/**
 * Every active group, paginated — the public browse-all list behind
 * /communities.
 *
 * Distinct from the discover payload's `communities`, which is only the
 * pin-tagged homepage slice. An admin needs this one to reach a group that
 * carries no tag yet; the homepage list by definition never contains those.
 */
export const getGroupDirectory = async ({clientMode}: {clientMode: ClientMode}) => {
    return await requestAllPages<Community>('/groups/directory', {clientMode, noCache: true})
}

/**
 * Platform-admin curation: replace a group's `group_tags`.
 *
 * The backend strips pin/top/featured from anyone who is not a platform admin
 * (GroupsController::PRIVILEGED_TAGS), so this is safe to call optimistically —
 * a non-admin's request succeeds but changes nothing privileged.
 */
export const updateGroupTags = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    groupTags: string[],
    authToken: string
}>) => {
    await request(`/groups/${params.groupId}`, {
        method: 'PATCH',
        body: {group: {group_tags: params.groupTags}},
        authToken: params.authToken,
        clientMode
    })
}

/**
 * Turn the "someone submitted an event to your group" email on or off for one
 * owner/manager membership.
 *
 * Keyed by membership id, not user id, because the caller already has the row
 * from the roster — going through findMembership would re-fetch every
 * membership in the group to toggle a checkbox. The backend authorizes this
 * separately from the role field: your own row needs nothing but membership,
 * someone else's needs manage rights.
 */
export const setAdminNotification = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    membershipId: string,
    adminNotification: boolean,
    authToken: string
}>) => {
    return await request<Membership>(`/groups/${params.groupId}/memberships/${params.membershipId}`, {
        method: 'PATCH',
        clientMode,
        authToken: params.authToken,
        body: {membership: {admin_notification: params.adminNotification}}
    })
}

/** Transfer ownership: grant the owner role to another user (owner-only op). */
export const transferGroup = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: string, newOwnerId: string, authToken: string}>) => {
    await request(`/groups/${params.groupId}/memberships`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {user_id: params.newOwnerId, role: 'owner'}
    })
}

export const leaveGroup = async ({params, clientMode}: SolaSdkFunctionParams<{profileId: string, groupId: string, authToken: string}>) => {
    const membership = await findMembership(params.groupId, params.profileId, clientMode)
    await request(`/groups/${params.groupId}/memberships/${membership.id}`, {
        method: 'DELETE',
        clientMode,
        authToken: params.authToken
    })
}

/**
 * Send invites — the backend reports a per-receiver result
 * @param receivers - names or emails
 * @param role - member | admin | owner
 */
export const sendInvite = async (
    {params, clientMode}: SolaSdkFunctionParams<{
        groupId: string,
        receivers: string[],
        role: string,
        message: string,
        authToken: string,
    }>
) => {
    const data = await request<{results: {address: string, result: string, message?: string}[]}>(
        `/groups/${params.groupId}/group_invites`,
        {
            method: 'POST',
            clientMode,
            authToken: params.authToken,
            body: {receivers: params.receivers, role: params.role, message: params.message}
        }
    )

    const failed = (data.results || []).filter(r => r.result === 'error')
    if (failed.length) {
        throw new Error(failed.map(f => `[${f.address}] ${f.message || 'invite failed'}`).join('; '))
    }
    return data.results
}

export const acceptInvite = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: string, inviteId: string, authToken: string}>) => {
    await request(`/groups/${params.groupId}/group_invites/${params.inviteId}/accept`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken
    })
}

export const rejectInvite = async ({params, clientMode}: SolaSdkFunctionParams<{groupId: string, inviteId: string, authToken: string}>) => {
    await request(`/groups/${params.groupId}/group_invites/${params.inviteId}`, {
        method: 'DELETE',
        clientMode,
        authToken: params.authToken
    })
}

/**
 * Mint a reusable code invite
 */
export const sendCodeInvite = async (
    {params, clientMode}: SolaSdkFunctionParams<{
        groupId: string,
        role: string,
        message?: string,
        authToken: string,
    }>
) => {
    return await request<InviteDetail>(`/groups/${params.groupId}/group_invites/send_with_code`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {role: params.role, message: params.message}
    })
}

export const acceptCodeInvite = async (
    {params, clientMode}: SolaSdkFunctionParams<{
        groupId: string,
        code: string,
        authToken: string,
    }>
) => {
    return await request<InviteDetail>(`/groups/${params.groupId}/group_invites/accept_with_code`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {code: params.code}
    })
}

export const getMyPendingInvites = async ({params, clientMode}: SolaSdkFunctionParams<{authToken: string}>) => {
    try {
        return await request<InviteDetail[]>('/group_invites/pending', {
            clientMode,
            authToken: params.authToken,
            noCache: true
        })
    } catch {
        return []
    }
}

/**
 * Featured groups for the homepage (public)
 */
export const getEventGroups = async ({clientMode}: {clientMode?: ClientMode}) => {
    const data = await request<{groups: Group[]}>('/discover', {clientMode})
    return data.groups || []
}

/**
 * Manager broadcast to all active group members (POST /groups/:id/send_email).
 * With testRecipient set, sends a single preview email to that address instead.
 */
export const sendEmailToGroupMembers = async (
    {params, clientMode}: SolaSdkFunctionParams<{
        groupId: string,
        subject: string,
        content: string,
        testRecipient?: string,
        authToken: string,
    }>
) => {
    const res = await request<{sent_count: number, test: boolean}>(`/groups/${params.groupId}/send_email`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {subject: params.subject, content: params.content, test_recipient: params.testRecipient}
    })
    return {sentCount: res.sent_count, isTest: res.test}
}
