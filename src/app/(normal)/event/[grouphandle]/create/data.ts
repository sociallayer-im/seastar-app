import {gql, request} from 'graphql-request'
import {AUTH_FIELD} from "@/utils"
import {getProfileByToken} from "@/service/solar"
import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {redirect} from "next/navigation"

export type EventDraftType = Pick<Solar.Event, 'id' | 'cover_url' | 'title' | 'track_id' | 'content' | 'notes'>

export interface CreateEventPageDataProps {
    grouphandle: string
}

export interface CreateEventDataProps {
    params: CreateEventPageDataProps
    cookies: ReadonlyRequestCookies
}

export interface CreateEventPageDataType {
    currProfile: Solar.Profile | null
    group: Solar.GroupSample
    memberships: Solar.Membership[]
    isOwner: boolean
    isManager: boolean
    isMember: boolean
    availableCreator: Array<Solar.ProfileSample | Solar.GroupSample>
    tracks: Solar.Track[]
}


export default async function CreateEventPageData({params, cookies}: CreateEventDataProps) {

    const authToken = cookies.get(AUTH_FIELD)?.value
    let currProfile: Solar.Profile | null = null
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    }

    const grouphandle = params.grouphandle
    const {groups, memberships, userGroups, tracks} = await getGroupData(grouphandle)
    if (!groups || !groups.length) {
        redirect('/error')
    }
    const group = groups[0]

    const isOwner = memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'owner'
    const isManager = memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'manager'
    const isMember = memberships.some(m => m.profile.handle === currProfile?.handle)

    const availableCreator: Array<Solar.ProfileSample | Solar.GroupSample> = currProfile
        ? [currProfile, ...(userGroups || [])]
        : []

    return {
        currProfile,
        group,
        memberships,
        isOwner,
        isManager,
        isMember,
        availableCreator,
        tracks
    } as CreateEventPageDataType
}

async function getGroupData(handle: string, currUserHandle?: string) {
    const doc = gql`query MyQuery {
            groups: groups(where: {handle: {_eq: "${handle}"}}) {
                id
                handle
                nickname
                image_url
            }
            memberships(where: {group: {handle: {_eq: "${handle}"}}}) {
                id
                role
                profile{
                    id
                    handle
                    nickname
                    image_url
                }
            }
            tracks: tracks(where: {group: {handle: {_eq: "${handle}"}}}) {
                id
                title
                group_id
                kind
            }
            ${currUserHandle ? `userGroups: groups(where: {status: {_neq: "freezed"}, memberships: {role: {_in: ["owner", "manager"]}, profile: {handle: {_eq: "${currUserHandle}"}}}}, order_by: {id: desc}) {id,image_url,handle,nickname}` : ''}
        }`

    // console.log(doc)

    interface GroupData {
        groups: Solar.GroupSample[],
        userGroups?: Solar.GroupSample[],
        memberships: Solar.Membership[],
        tracks: Solar.Track[]
    }

    return await request<GroupData>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}

export const emptyEvent: EventDraftType = {
    id: 0,
    cover_url: '',
    title: '',
    track_id: null,
    content: '',
    notes: null
}



