import {AUTH_FIELD} from "@/utils"
import {gql, request} from "graphql-request"
import {redirect} from "next/navigation"
import {getProfileByToken} from "@/service/solar"
import {cookies} from 'next/headers'

export interface GroupPageParams {
    handle: string
}

export interface GroupEditDataProps {
    params: GroupPageParams,
}

export interface MemberShipSample { role: string, profile: Solar.ProfileSample }


export interface GroupData {
    group: Solar.Group,
    currProfile: Solar.Profile | null,
    isGroupManager: boolean,
    isGroupMember: boolean,
    isGroupIssuer: boolean,
    isGroupOwner: boolean,
    members: {role: string, profile: Solar.ProfileSample}[],
}

export default async function GroupEditPageData({params}: GroupEditDataProps) {
    const handle = params.handle

    const {groups, memberships} = await getGroupData(handle)

    if (!groups || !groups.length) {
        redirect('/error')
    }

    const group = groups[0]

    console.log('group name', group.nickname)
    console.log('handle', handle)

    let currProfile: Solar.Profile | null = null
    const authToken = cookies().get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    }


    const owner = memberships.find(m => m.role === 'owner')
    const managers = memberships.filter(m => m.role === 'manager')
    const issuers = memberships.filter(m => m.role === 'issuer')
    const members = memberships.filter(m => m.role === 'member')

    const isGroupOwner = memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'owner'
    const isGroupManager = isGroupOwner || memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'manager'
    const isGroupMember = isGroupOwner || isGroupManager || memberships.some(m => m.profile.handle === currProfile?.handle)
    const isGroupIssuer = memberships.some(m => m.profile.handle === currProfile?.handle && m.role === 'issuer')

    return {
        group: group,
        currProfile: currProfile,
        isGroupOwner,
        isGroupManager,
        isGroupMember,
        isGroupIssuer,
        members: [owner, ...managers, ...issuers, ...members]
    } as GroupData
}

export async function getGroupData(handle: string) {
    const doc = gql`query MyQuery {
         groups: groups(where:{handle:{_eq: "${handle}"}}, order_by: {id: desc}) {
            handle
            id
            image_url
            nickname
            social_links
            about
            location
            map_enabled
            event_enabled
            event_tags
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

    // return await request<{
    //     groups: Solar.Group[],
    //     memberships: MemberShipSample[]
    // }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc, {fetchPolicy: "no-cache"})

    return await request<{
        groups: Solar.Group[],
        memberships: MemberShipSample[]
    }>({
        url: process.env.NEXT_PUBLIC_GRAPH_URL!,
        document: doc,
        requestHeaders: {
            fetchPolicy: "no-cache"
        }
    })
}
