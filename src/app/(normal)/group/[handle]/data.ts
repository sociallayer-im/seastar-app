import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    AUTH_FIELD,
} from "@/utils"
import {redirect} from "next/navigation"
import {cookies} from 'next/headers'
import {
    GroupDetail,
    Membership,
    getGroupDetailByHandle,
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
    members: Membership[],
    tab: string,
    canPublishEvent: boolean
}

export default async function GroupPageData(handle: string, tab='events'): Promise<GroupData> {

    const groupsDetail = await getGroupDetailByHandle({
        params: {groupHandle: handle},
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
        canPublishEvent
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupsDetail, currProfile)

    return {
        group: group,
        currProfile: currProfile,
        currUserIsManager: isManager,
        currUserIsMember: isMember,
        currUserIsIssuer: isIssuer,
        currUserIsOwner: isOwner,
        canPublishEvent,
        tab: tab || 'events',
        members: [owner, ...managers, ...issuers, ...members]
    } as GroupData
}
