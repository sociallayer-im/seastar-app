import {gql, request} from 'graphql-request'
import {AUTH_FIELD, getPrefillEventDateTime} from "@/utils"
import {getProfileByToken} from "@/service/solar"
import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {redirect} from "next/navigation"

export interface EventDraftType extends Pick<Solar.Event, 'id' | 'cover_url' | 'title' | 'track_id' | 'content' | 'notes' | 'venue_id' | 'geo_lat' | 'geo_lng' | 'formatted_address' | 'location_data' | 'location'| 'start_time' | 'end_time' | 'meeting_url' | 'event_roles' | 'tags' | 'max_participant' | 'display' | 'pinned' | 'status' | 'badge_class_id' | 'group_id'> {
    timezone: string | null
}

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
    isGroupOwner: boolean
    isGroupManager: boolean
    isGroupMember: boolean
    availableHost: Array<Solar.ProfileSample | Solar.GroupSample>
    tracks: Solar.Track[],
    venues: Solar.Venue[],
    tags: string[],
    badgeClasses: Solar.BadgeClass[]
}


export default async function CreateEventPageData({params, cookies}: CreateEventDataProps) {

    const authToken = cookies.get(AUTH_FIELD)?.value
    let currProfile: Solar.Profile | null = null
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    } else {
        redirect('/')
    }

    const grouphandle = params.grouphandle
    const {groups, memberships, userGroups, tracks, venues, badgeClasses} = await getGroupData(grouphandle, currProfile?.handle)
    if (!groups || !groups.length) {
        redirect('/error')
    }
    const group = groups[0]

    const isGroupOwner = memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'owner'
    const isGroupManager = isGroupOwner || memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'manager'
    const isGroupMember = isGroupOwner || isGroupManager || memberships.some(m => m.profile.handle === currProfile?.handle)

    const availableHost: Array<Solar.ProfileSample | Solar.GroupSample> = currProfile
        ? [currProfile, ...(userGroups || [])]
        : []

    return {
        currProfile,
        group,
        memberships,
        isGroupOwner,
        isGroupManager,
        isGroupMember,
        availableHost,
        tracks,
        venues,
        tags: group.event_tags || [],
        badgeClasses: badgeClasses || []
    } as CreateEventPageDataType
}

export async function getGroupData(handle: string, currUserHandle?: string) {
    const doc = gql`query MyQuery {
            groups: groups(where: {handle: {_eq: "${handle}"}}) {
                id
                handle
                nickname
                image_url
                event_tags
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
            venues: venues(where: {group: {handle: {_eq: "${handle}"}}, removed: {_is_null: true}}) {
                id
                title
                about
                location
                location_data
                formatted_address
                geo_lat
                geo_lng
                start_date
                end_date
                capacity
                link
                visibility
                require_approval
                venue_overrides {
                    id
                    day
                    disabled
                    start_at
                    end_at
                    role
                }
                venue_timeslots {
                    id
                    day_of_week
                    disabled
                    start_at
                    end_at
                    role
                }
            }
            ${currUserHandle ? `userGroups: groups(where: {status: {_neq: "freezed"}, memberships: {role: {_in: ["owner", "manager"]}, profile: {handle: {_eq: "${currUserHandle}"}}}}, order_by: {id: desc}) {id,image_url,handle,nickname}` : ''}
            ${currUserHandle ? `badgeClasses: badge_classes(where: {creator: {handle: {_eq: "${currUserHandle}"}}, badge_type:{_eq: "badge"}}, order_by: {id: desc}, limit: 20) {id,title,image_url}` : ''}
        }`

    // console.log(doc)

    interface GroupData {
        groups: Solar.Group[],
        userGroups?: Solar.GroupSample[],
        memberships: Solar.Membership[],
        tracks: Solar.Track[]
        venues: Solar.Venue[]
        badgeClasses?: Solar.BadgeClass[]
    }

    return await request<GroupData>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}

export const emptyEvent: EventDraftType = {
    id: 0,
    cover_url: '',
    title: '',
    track_id: null,
    content: '',
    notes: null,
    venue_id: null,
    geo_lat: null,
    geo_lng: null,
    formatted_address: null,
    location: null,
    location_data: null,
    start_time: getPrefillEventDateTime().initStartTime.toISOString(),
    end_time: getPrefillEventDateTime().initEndTime.toISOString(),
    timezone: null,
    meeting_url: '',
    event_roles: [],
    tags: [],
    max_participant: null,
    display: 'normal',
    pinned: false,
    status: 'open',
    badge_class_id: null
}



