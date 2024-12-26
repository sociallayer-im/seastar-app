import {gql, request} from 'graphql-request'
import {SampleEvent, SampleEventWithCreatorAndJoinStatus} from "@/app/(normal)/profile/[handle]/TabEvents/data"

export const GroupEventListData = async function (handle: string, currUserHandle?: string) {
    const doc = gql`query MyQuery {
        events: events(where: {group: {handle: {_eq: "${handle}"}} status: {_neq: "cancel"}}, order_by: {id: desc}, limit: 100) {
                id
                title
                location
                cover_url
                start_time
                end_time
                timezone
                tags
                geo_lng
                geo_lat
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
    }`

    type Response = {
        events: SampleEvent[],
        currUserJoined?: {event: {id: number}}[],
    }

    const {events, currUserJoined} = await request<Response>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)

    return events.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!currUserJoined?.find(j => j.event.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as SampleEventWithCreatorAndJoinStatus
    })

}
