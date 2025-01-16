import {AUTH_FIELD, pickSearchParam} from "@/utils"
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
    members: Membership[],
    tab: string,
}

export default async function GroupPageData({params, searchParams}: GroupDataProps) {
    const handle = params.handle
    const tab = pickSearchParam(searchParams.tab)

    const groupsDetail = await getGroupDetailByHandle(handle)

    console.log('groupsDetail',groupsDetail?.handle)

    if (!groupsDetail) {
        redirect('/error')
    }

    const group = groupsDetail

    let currProfile: ProfileDetail| null = null
    const authToken = cookies().get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileDetailByAuth(authToken)
    }

    const owner = groupsDetail.memberships.find(m => m.role === 'owner')
    const managers = groupsDetail.memberships.filter(m => m.role === 'manager')
    const issuers = groupsDetail.memberships.filter(m => m.role === 'issuer')
    const members = groupsDetail.memberships.filter(m => m.role === 'member')

    const currUserIsManager = groupsDetail.memberships.some(m => m.profile.handle === currProfile?.handle && (m.role === 'manager' || m.role === 'owner'))
    const currUserIsMember = groupsDetail.memberships.some(m => m.profile.handle === currProfile?.handle)
    const currUserIsIssuer = groupsDetail.memberships.some(m => m.profile.handle === currProfile?.handle && m.role === 'issuer')

    return {
        group: group,
        currProfile: currProfile,
        currUserIsManager,
        currUserIsMember,
        currUserIsIssuer,
        tab: tab || 'events',
        members: [owner, ...managers, ...issuers, ...members]
    } as GroupData
}
