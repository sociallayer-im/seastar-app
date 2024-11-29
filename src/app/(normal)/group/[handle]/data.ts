import {AUTH_FIELD, pickSearchParam} from "@/utils"
import {gql, request} from "graphql-request"
import {redirect} from "next/navigation"
import {getProfileByToken} from "@/service/solar"
import {cookies} from 'next/headers'

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

export interface MemberShipSample { role: string, profile: Solar.ProfileSample }

export type GroupDetail = Pick<Solar.Group, 'id' | 'handle' | 'image_url' | 'about' | 'social_links' | 'nickname' | 'location'>

export interface GroupData {
    group: GroupDetail,
    currProfile: Solar.Profile | null,
    currUserIsManager: boolean,
    currUserIsMember: boolean,
    currUserIsIssuer: boolean,
    members: {role: string, profile: Solar.ProfileSample}[],
    tab: string,
}

export default async function GroupPageData({params, searchParams}: GroupDataProps) {
    const handle = params.handle
    const tab = pickSearchParam(searchParams.tab)

    const {groups, memberships} = await getGroupData(handle)

    if (!groups || !groups.length) {
        redirect('/error')
    }

    const group = groups[0]

    let currProfile: Solar.Profile | null = null
    const authToken = cookies().get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    }


    const owner = memberships.find(m => m.role === 'owner')
    const managers = memberships.filter(m => m.role === 'manager')
    const issuers = memberships.filter(m => m.role === 'issuer')
    const members = memberships.filter(m => m.role === 'member')

    const currUserIsManager = memberships.some(m => m.profile.handle === currProfile?.handle && (m.role === 'manager' || m.role === 'owner'))
    const currUserIsMember = memberships.some(m => m.profile.handle === currProfile?.handle)
    const currUserIsIssuer = memberships.some(m => m.profile.handle === currProfile?.handle && m.role === 'issuer')

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

async function getGroupData(handle: string) {
    const doc = gql`query MyQuery {
         groups: groups(where:{handle:{_eq: "${handle}"}}) {
            handle
            id
            image_url
            nickname
            social_links
            about
            location
         }
        memberships: memberships(where: {group: {handle: {_eq: "${handle}"}}}) {
            role
            profile {
                id
                image_url
                handle
                nickname
            }
        }
    }`

    // console.log('doc', doc)

    return await request<{
        groups: GroupDetail[],
        memberships: MemberShipSample[]
    }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}
