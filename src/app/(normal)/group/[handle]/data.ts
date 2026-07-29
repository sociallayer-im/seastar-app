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
    ProfileDetail, getProfileDetailByAuth
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
    tab: string,
    canPublishEvent: boolean
    canSubmitEvent: boolean
}

export default async function GroupPageData(handle: string, tab='events'): Promise<GroupData> {

    const groupsDetail = await getGroupDetailByName({
        params: {groupName: handle},
        clientMode: CLIENT_MODE
    })

    if (!groupsDetail) {
        redirect('/error')
    }

    const group = groupsDetail

    let currProfile: ProfileDetail | null = null
    const authToken = cookies().get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileDetailByAuth({
            params: {authToken},
            clientMode: CLIENT_MODE
        })
    }

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

    // group.parent (from GroupBlueprint's base association) carries no
    // memberships — fetch the parent's own detail to check the current
    // user's role there.
    let currUserIsParentManager = false
    if (!isManager && group.parent_id && currProfile) {
        const parentGroup = await getGroupDetailById({params: {groupId: group.parent_id}, clientMode: CLIENT_MODE})
        if (parentGroup) {
            const {isManager: isParentManager} = analyzeGroupMembershipAndCheckProfilePermissions(parentGroup, currProfile)
            currUserIsParentManager = isParentManager
        }
    }

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
        members: [owner, ...managers, ...issuers, ...members]
    } as GroupData
}
