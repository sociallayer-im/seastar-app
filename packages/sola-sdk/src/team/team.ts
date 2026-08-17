import {SolaSdkFunctionParams} from '../types'
import {request, Paginated} from '../request'
import {Profile} from '../profile/types'

/**
 * Teams — named subsets of a group's members.
 *
 * The same shape as a track, one level down: a track groups a group's events,
 * a team groups its people. A person can be in any number of them.
 *
 * A team grants nothing on its own. The single place one affects access is a
 * discussion board that names it, and there the board is doing the referring.
 */
export interface Team {
    id: string,
    group_id: string,
    name: string,
    slug: string,
    description: string | null,
    /** Optional badge colour; falls back to getLabelColor(name). */
    color: string | null,
    sort: number,
    members_count: number,
    archived: boolean,
    /** Whether this team's badge is shown to people outside the group. The
     *  roster is a public endpoint, so this is what decides whether the name
     *  travels with it. Private by default. */
    is_public: boolean,
    created_at: string,
}

/** TeamRefBlueprint — the shape embedded on a membership row. */
export interface TeamRef {
    id: string,
    name: string,
    slug: string,
    color: string | null,
    /** The manager's ordering. Sort by this, never by localeCompare — that is
     *  locale-dependent and so differs between the server render and the
     *  browser, which React reports as a hydration mismatch. */
    sort: number,
}

export interface TeamDraft {
    group_id?: string,
    name?: string,
    slug?: string,
    description?: string | null,
    color?: string | null,
    sort?: number,
    archived?: boolean,
    is_public?: boolean,
}

/** Members and managers only — a team annotates the roster, which is not public. */
export const getTeams = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    authToken: string,
}>) => {
    const res = await request<Paginated<Team>>('/teams', {
        params: {group_id: params.groupId, limit: 100},
        authToken: params.authToken, clientMode, noCache: true
    })
    return res.data
}

export const createTeam = async ({params, clientMode}: SolaSdkFunctionParams<{
    draft: TeamDraft & {group_id: string, name: string},
    authToken: string,
}>) => {
    return await request<Team>('/teams', {
        method: 'POST', body: {team: params.draft},
        authToken: params.authToken, clientMode
    })
}

export const updateTeam = async ({params, clientMode}: SolaSdkFunctionParams<{
    teamId: string,
    draft: TeamDraft,
    authToken: string,
}>) => {
    return await request<Team>(`/teams/${params.teamId}`, {
        method: 'PATCH', body: {team: params.draft},
        authToken: params.authToken, clientMode
    })
}

/**
 * Deleting a team un-groups people; it removes nobody from the group. A
 * discussion board that named this team stops naming it, and so becomes
 * visible to managers only — worth warning about before calling this.
 */
export const deleteTeam = async ({params, clientMode}: SolaSdkFunctionParams<{
    teamId: string,
    authToken: string,
}>) => {
    return await request(`/teams/${params.teamId}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}

export const getTeamMembers = async ({params, clientMode}: SolaSdkFunctionParams<{
    teamId: string,
    authToken: string,
}>) => {
    const res = await request<Paginated<Profile>>(`/teams/${params.teamId}/members`, {
        params: {limit: 200}, authToken: params.authToken, clientMode, noCache: true
    })
    return res.data
}

export const addTeamMember = async ({params, clientMode}: SolaSdkFunctionParams<{
    teamId: string,
    userId: string,
    authToken: string,
}>) => {
    return await request(`/teams/${params.teamId}/members`, {
        method: 'POST', body: {user_id: params.userId},
        authToken: params.authToken, clientMode
    })
}

export const removeTeamMember = async ({params, clientMode}: SolaSdkFunctionParams<{
    teamId: string,
    userId: string,
    authToken: string,
}>) => {
    return await request(`/teams/${params.teamId}/members/${params.userId}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}
