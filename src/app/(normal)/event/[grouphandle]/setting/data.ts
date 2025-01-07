import {gql, request} from "graphql-request"
import {redirect} from "next/navigation"
export interface GroupEventSettingDataParams {
    grouphandle: string
}

export interface GroupEventSettingDataProps {
    params: GroupEventSettingDataParams
}

export default async function GroupEventSettingData(props: GroupEventSettingDataProps) {
    const {groups, venues, tracks} = await getGroupEventSettingData(props.params.grouphandle)

    if (!groups || !groups.length) {
        redirect('/404')
    }

    const group = groups[0]
    return {
        group: group,
        venues: venues,
        tracks: tracks
    }
}

export function getGroupEventSettingData(groupHandle: string) {
    const doc = gql`query MyQuery {
          groups:groups(where: {handle: {_eq: "${groupHandle}"}}) {
            event_tags
            timezone
            handle
            banner_link_url
            banner_image_url
            can_publish_event
            can_join_event
            can_view_event
          },
          venues:venues(where:{group: {handle: {_eq: "${groupHandle}"}}}){id},
          tracks:tracks(where:{group: {handle: {_eq: "${groupHandle}"}}}){id}
   }`

    console.log('doc', doc)

    return request<{
        groups: Solar.Group[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}