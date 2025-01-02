import {gql, request} from "graphql-request"
import {redirect} from "next/navigation"

export interface BadgePageParams {
    badgeid: string
}

export interface BadgePageDataProps {
    params: BadgePageParams
}

export default async function BadgePageData({params}: BadgePageDataProps) {
    const {badges} = await getBadgeData(parseInt(params.badgeid))

    if (!badges.length) {
        redirect('/404')
    }

    return {
        badge: badges[0],
        badgeClass: badges[0].badge_class
    }
}

export async function getBadgeData(badgeId: number) {
    const doc = gql`query MyQuery {
     badges(where:{id:{_eq: ${badgeId}}}, order_by: {id: desc}) {
         id
         created_at
         image_url
         metadata
         title
         display
         status
         content
         owner {
            id
            nickname
            handle
            image_url
            username
          }
          badge_class {
            content
            creator {
              nickname
              id
              image_url
              username
            }
            id
            image_url
            title
            badge_type
            created_at
            metadata
          }
      }
    }`

    // console.log(doc)

    const data = await request<{badges: Solar.Badge[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return data
}