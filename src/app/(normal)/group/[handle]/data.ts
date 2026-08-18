import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    AUTH_FIELD,
} from "@/utils"
import {redirect} from "next/navigation"
import {cookies} from 'next/headers'
import {
    GroupDetail,
    Membership,
    getGroupDetailByName,
    getGroupDetailById,
    ProfileDetail, getProfileDetailByAuth, getTeams, Team
} from "@sola/sdk"
import {CLIENT_MODE} from '@/app/config'

export interface GroupPageParams {
    handle: string
}

export interface GroupPageSearchParams {
    tab?: 'events' | 'badges' | 'chat' | 'votes' | 'members' | string[]
}

export interface GroupDataProps {
    params: GroupPageParams,
    searchParams: GroupPageSearchParams,
}

export interface GroupData {
    group: GroupDetail,
    currProfile: ProfileDetail | null,
    currUserIsManager: boolean,
    currUserIsMember: boolean,
    currUserIsIssuer: boolean,
    currUserIsOwner: boolean,
    // The parent group's admin/owner — per GroupPolicy#can_assign_manager?,
    // this grants ONLY the ability to toggle a child-group member's role
    // to/from "manager" (an explicit, interim, documented restriction — see
    // soon/design/CHANGELOG.md 2026-07-29). It grants nothing else: no
    // member add/remove, no group-settings edit, no venue/event management.
    currUserIsParentManager: boolean,
    members: Membership[],
    /** Every team in the group — only populated for managers, who are the only
     *  people offered the per-member edit dialog. */
    teams: Team[],
    tab: string,
    canPublishEvent: boolean
    canSubmitEvent: boolean
}

export default async function GroupPageData(handle: string, tab='events'): Promise<GroupData> {

    const authToken = (await cookies()).get(AUTH_FIELD)?.value

    // With the token: the roster's private team badges are only rendered for
    // people in the group, so an anonymous fetch would hide a member's own
    // teams from them. The group and the viewer's profile are independent
    // reads — fetch both at once.
    const [groupsDetail, currProfile] = await Promise.all([
        getGroupDetailByName({
            params: {groupName: handle, authToken},
            clientMode: CLIENT_MODE
        }),
        authToken
            ? getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
            : Promise.resolve<ProfileDetail | null>(null)
    ])

    if (!groupsDetail) {
        redirect('/error')
    }

    const group = groupsDetail

    const {
        owner,
        managers,
        issuers,
        members,
        isManager,
        isOwner,
        isMember,
        isIssuer,
        canPublishEvent,
        canSubmitEvent
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupsDetail, currProfile)

    // Both follow-ups depend only on the membership analysis and not on each
    // other — one round trip.
    const [currUserIsParentManager, teams] = await Promise.all([
        // group.parent (from GroupBlueprint's base association) carries no
        // memberships — fetch the parent's own detail to check the current
        // user's role there.
        (async () => {
            if (!isManager && group.parent_id && currProfile) {
                const parentGroup = await getGroupDetailById({params: {groupId: group.parent_id}, clientMode: CLIENT_MODE})
                if (parentGroup) {
                    return analyzeGroupMembershipAndCheckProfilePermissions(parentGroup, currProfile).isManager
                }
            }
            return false
        })(),
        // Only managers can act on teams, and only they are shown the edit
        // dialog — so nobody else pays for the request.
        isManager && authToken
            ? getTeams({params: {groupId: group.id, authToken}, clientMode: CLIENT_MODE}).catch(() => [] as Team[])
            : Promise.resolve([] as Team[])
    ])

    return {
        group: group,
        currProfile: currProfile,
        currUserIsManager: isManager,
        currUserIsMember: isMember,
        currUserIsIssuer: isIssuer,
        currUserIsOwner: isOwner,
        currUserIsParentManager,
        canPublishEvent,
        canSubmitEvent,
        tab: tab || 'events',
        members: [owner, ...managers, ...issuers, ...members],
        teams
    } as GroupData
}
