import {gql, request} from "graphql-request"
import dayjs from "@/libs/dayjs"
import {EventDraftType} from '@sola/sdk'


const api = process.env.NEXT_PUBLIC_API_URL


export const getProfileByToken = async (auth_token?: string) => {
    if (!auth_token) return null
    const url = `${api}/profile/me?auth_token=${auth_token}`
    // console.log(url)
    const response = await fetch(url)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getProfileByHandle = async (handle: string) => {
    const url = `${api}/profile/get_by_handle?handle=${handle}`
    // console.log(url)
    const response = await fetch(url)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getEventDetail = async (event_id: number) => {
    const response = await fetch(`${api}/event/get?id=${event_id}`)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return {
        ...data,
        venue_id: data.venue?.id
    } as Solar.Event
}

export const uploadFile = async (file: Blob, auth_token: string) => {
    const formData = new FormData()
    formData.append('auth_token', auth_token)
    formData.append('uploader', 'user')
    formData.append('resource', Math.random().toString(36).slice(-8))
    formData.append('data', file)
    const response = await fetch(`${api}/service/upload_image`, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.result.url as string
}

export const updateProfile = async (profile: Solar.Profile, auth_token: string) => {
    const response = await fetch(`${api}/profile/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...profile, auth_token})
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getOccupiedTimeEvent = async (startTime: string, endTime: string, timezone: string, venueId: number | null, excludeEventId?: number) => {
    if (!venueId) return null

    const doc = gql`query MyQuery {
        events(where: {venue_id: {_eq: ${venueId}}, status: {_neq: ["cancelled"]}${excludeEventId ? `,id: {_neq:${excludeEventId}}` : ''}}) {
            id
            title
            start_time
            end_time
        }
    }`

    const {events} = await request<{ events: Solar.Event[] }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)

    // console.log('events', events)

    return events.find((e) => {
        const eventStartTime = new Date(e.start_time!).getTime()
        const eventEndTime = new Date(e.end_time!).getTime()
        const selectedStartTime = new Date(startTime).getTime()
        const selectedEndTime = new Date(endTime).getTime()
        const eventIsAllDay = dayjs.tz(eventStartTime, timezone).hour() === 0 && (eventEndTime - eventStartTime + 60000) % 8640000 === 0
        const selectedIsAllDay = dayjs.tz(selectedStartTime, timezone).hour() === 0 && (selectedEndTime - selectedStartTime + 60000) % 8640000 === 0
        return ((selectedStartTime < eventStartTime && selectedEndTime > eventStartTime) ||
                (selectedStartTime >= eventStartTime && selectedEndTime <= eventEndTime) ||
                (selectedStartTime < eventEndTime && selectedEndTime > eventEndTime)) &&
            (!eventIsAllDay && !selectedIsAllDay)
    }) || null

}

export async function getBadgeClassDetailById(id: number) {
    const doc = gql`query MyQuery {
        badge_classes(where: {id: {_eq: ${id}}}) {
            id
            title
            image_url
            group_id
        }
    }`

    const badgeClasses = await request<{ badge_classes: Solar.BadgeClass[] }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return badgeClasses.badge_classes[0]
}

export async function getUserBadgeClasses(userHandle: string) {
    const doc = gql`query MyQuery {
        badge_classes(where: {group: {memberships: {profile: {handle: {_eq: "${userHandle}"}}}}}) {
            id
            title
            image_url
            group_id
            metadata
            content
            group_id
            transferable
            badge_type
            permissions
            created_at
            display
        }
    }`

    const badgeClasses = await request<{ badge_classes: Solar.BadgeClass[] }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return badgeClasses.badge_classes
}

export async function getGroupBadgeClasses(groupId: number, limit = 20) {
    const doc = gql`query MyQuery {
        badge_classes(where: {group_id: {_eq: ${groupId}}, badge_type:{_eq: "badge"}}, ${limit ? `limit: ${limit}` : ''}) {
            id
            title
            image_url
            group_id
            metadata
            content
            group_id
            transferable
            badge_type
            permissions
            created_at
            display
        }
    }`

    const badgeClasses = await request<{ badge_classes: Solar.BadgeClass[] }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return badgeClasses.badge_classes
}

export async function SearchProfile(keyword: string, limit = 5) {
    const doc = gql`query MyQuery {
          exact : profiles(where: {_or: [{handle: {_eq: "${keyword}"}}, { nickname:{_eq: "${keyword}"}}]}, limit: ${limit}){
            id
            handle
            username
            nickname
            image_url
          }
          predict: profiles(where: {_or: [{nickname: {_iregex: "${keyword}"}}, { handle:{_iregex: "${keyword}"}}]}, limit: ${limit}){
            id
            handle
            username
            nickname
            image_url
          }
        }`

    const {exact, predict} = await request<{
        exact: Solar.ProfileSample[],
        predict: Solar.ProfileSample[]
    }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return [...exact, ...predict]
}

export interface CreateEventProps extends EventDraftType {
    auth_token: string
}

export async function CreteEvent(props: CreateEventProps) {
    const eventProps = {
        ...props,
        extra: props.event_roles?.filter(r => !r.item_id && !!r.email).map(r => r.email),
        event_roles_attributes: props.event_roles
    }


    const response = await fetch(`${api}/event/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventProps)
    })

    if (!response.ok) {
        throw new Error('Create failed')
    }

    const data = await response.json()
    return data.evet as Solar.Event
}

export const updateGroup = async (group: Solar.Group, auth_token: string) => {
    const response = await fetch(`${api}/group/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...group,
            social_links: JSON.stringify(group.social_links),
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.group as Solar.Group
}
