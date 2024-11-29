import {gql, request} from "graphql-request"
import {SampleBadgeClass} from "@/app/(normal)/profile/[handle]/TabBadges/data"

export type SampleInvite = Pick<Solar.Invite, 'id' | 'role' | 'group' >

export default async function GroupBadgeData(handle: string) {
    const doc = gql`query MyQuery {
        created: badge_classes(where: {group: {handle: {_eq: "${handle}"}}}) {
            id
            image_url
            title
            creator_id
            content,
            display,
            metadata,
            badge_type
        }
        invites: group_invites(where: {status: {_eq: "sending"} group: {handle: {_eq: "${handle}"}}}) {
            id
            role
            group {
                image_url
                nickname
                handle
                id
            }
        }
    }`

    return await request<{created: SampleBadgeClass[], invites: SampleInvite[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}
