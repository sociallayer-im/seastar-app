import {gql, request} from "graphql-request"
import {redirect} from "next/navigation"

export interface BadgeClassPageParams {
    badgeclassid: string
}

export interface BadgeClassPageDataProps {
    params: BadgeClassPageParams
}

export default async function BadgeClassPageData({params}: BadgeClassPageDataProps) {
    const {badge_classes, badges} = await getBadgeClassData(parseInt(params.badgeclassid))

    if (!badge_classes.length) {
        redirect('/404')
    }

    return {
        badgeClass: badge_classes[0],
        badges
    }
}

export async function getBadgeClassData(badgeClassId: number) {
    const doc = gql`query MyQuery {
      badge_classes(where:{id:{_eq: ${badgeClassId}}}) {
        content
        counter
        creator {
          nickname
          id
          image_url
          username
        }
        creator_id
        group {
          id
          image_url
          nickname
          username
        }
        group_id
        id
        image_url
        name
        title
        badge_type
        created_at
        metadata
      }
      badges(where:{badge_class_id:{_eq: ${badgeClassId}}, status: {_neq: "rejected"}}, order_by: {id: desc}) {
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
      }
    }`

    // console.log(doc)

    const data = await request<{badge_classes: Solar.BadgeClass[], badges: Solar.Badge[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return data
}

