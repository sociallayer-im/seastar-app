import {gql, request} from 'graphql-request'

export type SampleBadge = Pick<Solar.Badge, 'id' | 'image_url' | 'title' | 'display' | 'badge_class' | 'metadata'>
export type SampleBadgeClass = Pick<Solar.BadgeClass, 'id' | 'image_url' | 'title' | 'display' | 'metadata' | 'badge_type'>

export const ProfileBadgeListData = async (handle: string) => {
    const doc = gql`query MyQuery {
        owned: badges(where: {owner: {handle: {_eq: "${handle}"}}}, order_by: {id: desc}) {
            id
            image_url
            title
            owner_id
            creator_id
            content,
            display,
            metadata,
            badge_class {
                id,
                title,
                image_url,
                display,
                badge_type
            }
        }
        
        created: badge_classes(where: {creator: {handle: {_eq: "${handle}"}}}, order_by: {id: desc}) {
            id
            image_url
            title
            creator_id
            content,
            display,
            metadata,
            badge_type
        }
    }`

    const {created, owned} = await request<{
        owned: SampleBadge[],
        created: SampleBadgeClass[]
    }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)

    // move to top if display equals to 'top'
    owned.sort((a, b) => a.display === 'top' ? -1 : b.display === 'top' ? 1 : 0)
    created.sort((a, b) => a.display === 'top' ? -1 : b.display === 'top' ? 1 : 0)

    return {
        created,
        owned
    }
}
