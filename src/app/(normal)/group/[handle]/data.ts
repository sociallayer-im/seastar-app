import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    AUTH_FIELD,
    pickSearchParam
} from "@/utils"
import {redirect} from "next/navigation"
import {cookies} from 'next/headers'
import {
    GroupDetail,
    Profile,
    ClientMode,
    Membership,
    setSdkConfig,
    getGroupDetailByHandle,
    ProfileDetail, getProfileDetailByAuth
} from "@sola/sdk"

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

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
    currProfile: Profile | null,
    currUserIsManager: boolean,
    currUserIsMember: boolean,
    currUserIsIssuer: boolean,
    currUserIsOwner: boolean,
    members: Membership[],
    tab: string,
}

export default async function GroupPageData({params, searchParams}: GroupDataProps) {
    const handle = params.handle
    const tab = pickSearchParam(searchParams.tab)

    const groupsDetail = await getGroupDetailByHandle(handle)

    console.log('groupsDetail', groupsDetail?.handle)

    if (!groupsDetail) {
        redirect('/error')
    }

    const group = groupsDetail

    let currProfile: ProfileDetail | null = null
    const authToken = cookies().get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileDetailByAuth(authToken)
    }

    const {
        owner,
        managers,
        issuers,
        members,
        isManager,
        isOwner,
        isMember,
        isIssuer
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupsDetail, currProfile)

    return {
        group: group,
        currProfile: currProfile,
        currUserIsManager: isManager,
        currUserIsMember: isMember,
        currUserIsIssuer: isIssuer,
        currUserIsOwner: isOwner,
        tab: tab || 'events',
        members: [owner, ...managers, ...issuers, ...members]
    } as GroupData
}
