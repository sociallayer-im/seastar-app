import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '@sola/sdk'

export const BADGE_CLASS_FRAGMENT = gql`
    fragment BadgeClassFragment on badge_classes {
        id
        title
        creator_id
        image_url
        display
    }`

export const BADGE_CLASS_DETAIL_FRAGMENT = gql`
    fragment ProfileDetailFragment on badge_classes {
        ...BadgeClassFragment
        metadata
        content
        group_id
        transferable
        badge_type
        permissions
        created_at
        can_send_badge
        creator {
          ...ProfileFragment
        }
    }
     ${BADGE_CLASS_FRAGMENT}
     ${PROFILE_FRAGMENT}
`

export const GET_BADGE_CLASS_BY_OWNER_HANDLE = gql`
    ${BADGE_CLASS_FRAGMENT}
    query GetBadgeClassByOwnerHandle($handle: String!) {
        badge_classes(where: {creator: {handle: {_eq: $handle}}}) {
            ...BadgeClassFragment
        }
    }
`
