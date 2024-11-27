import {gql, request} from 'graphql-request'
import {cookies} from 'next/headers'
import process from "node:process"

export type SampleEvent = Pick<Solar.Event, 'id' | 'title' | 'location' | 'cover_url' | 'start_time' | 'end_time' | 'timezone' | 'tags' | 'meeting_url' | 'event_roles' | 'status' | 'owner'>
export interface SampleEventWithCreatorAndJoinStatus extends SampleEvent {
    isCreator: boolean
    isJoined: boolean
}

export const ProfileEventListData = async function (handle: string, currUserHandle?: string) {
    const doc = gql`query MyQuery {
        attends: participants(where: {status: {_neq: "cancel"} profile: {handle: {_eq: "${handle}"}} event: {status: {_neq: "cancel"}}}, order_by: {id: desc}) {
            id
            event {
                id
                title
                location
                cover_url
                start_time
                end_time
                timezone
                tags
                meeting_url
                status
                event_roles {
                    id,
                    event_id,
                    item_id,
                    email,
                    nickname,
                    image_url,
                    role
                }
                owner {
                    id,
                    handle,
                    nickname,
                    image_url
                }
            }
        }
        hosting: events(where: {owner: {handle: {_eq: "${handle}"}} status: {_neq: "cancel"}}, order_by: {id: desc}) {
                id
                title
                location
                cover_url
                start_time
                end_time
                timezone
                tags
                meeting_url
                status
                event_roles {
                    id,
                    event_id,
                    item_id,
                    email,
                    nickname,
                    image_url,
                    role
                }
                owner {
                    id,
                    handle,
                    nickname,
                    image_url
                }
        }
        ${currUserHandle ? `currUserJoined: participants(where: {status: {_neq: "cancel"} profile: {handle: {_eq: "${currUserHandle}"}} event: {status: {_neq: "cancel"}}}) {
                event { id } }` : ''}
        ${currUserHandle ? `currUserHosting: events(where: {owner: {handle: {_eq: "${currUserHandle}"}}}) {
                id}`: ''}    
    }`

    type Response = {
        attends: {event: SampleEvent}[],
        hosting: SampleEvent[],
        currUserJoined?: {event: {id: number}}[],
        currUserHosting?: {id: number}[]
    }

    const [res1, res2] = await Promise.all([
        request<Response>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc),
        getStaredEvent(handle, currUserHandle)
    ])

    const hosting = res1.hosting.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!res1.currUserHosting?.find(h => h.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as SampleEventWithCreatorAndJoinStatus
    })

    const attends = res1.attends.map(e => {
        const isCreator = e.event.owner.handle === currUserHandle
        const isJoined = !!res1.currUserJoined?.find(h => h.event.id === e.event.id)
        return {
            ...e.event,
            isCreator,
            isJoined
        } as SampleEventWithCreatorAndJoinStatus
    })

    const stared = res2.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!res1.currUserJoined?.find(h => h.event.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as SampleEventWithCreatorAndJoinStatus
    })

    return {
        hosting,
        attends,
        stared
    }
}

const getStaredEvent = async (handle: string, currUserHandle?: string) => {
    if (handle !== currUserHandle) {
        // only fetch data when the user is viewing his own profile
        return []
    }

    const auth_token = cookies().get(process.env.NEXT_PUBLIC_AUTH_FIELD!)?.value
    if (!auth_token) {
        return []
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL!}/event/my_event_list?collection=my_stars&auth_token=${auth_token}`
    // console.log(url)
    try {
        const res = await fetch(url)
        if (!res.ok) {
            return []
        }

        const data = await res.json()
        return data.events as SampleEvent[]
    } catch (e: unknown) {
        console.error(e)
        return []
    }
}
