import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'

export const BADGE_CLASS_FRAGMENT = gql`
    fragment BadgeClassFragment on badge_classes {
        id
        title
        creator_id
        image_url
        display
        badge_type
    }`

export const BADGE_CLASS_DETAIL_FRAGMENT = gql`
    fragment BadgeClassDetailFragment on badge_classes {
        ...BadgeClassFragment
        metadata
        content
        group_id
        transferable
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

export const GET_BADGE_CLASS_DETAIL_BY_BADGE_CLASS_ID = gql`
    ${BADGE_CLASS_DETAIL_FRAGMENT}
    query GetBadgeClassDetailByBadgeClassId($id: Int!) {
        badge_classes(where: {id: {_eq: $id}}) {
            ...BadgeClassDetailFragment
        }
    }
`

export const GET_BADGE_CLASS_BY_OWNER_HANDLE = gql`
    ${BADGE_CLASS_FRAGMENT}
    query GetBadgeClassByOwnerHandle($handle: String!) {
        badge_classes(where: {creator: {handle: {_eq: $handle}}, status: {_eq: "accepted"}}) {
            ...BadgeClassFragment
        }
    }
`

export const BADGE_FRAGMENT = gql`
    ${BADGE_CLASS_FRAGMENT}
    fragment BadgeFragment on badges {
        id
        image_url
        title
        owner_id
        creator_id
        display
        badge_class {
            ...BadgeClassFragment
        }
    }`


export const BADGE_DETAIL_FRAGMENT = gql`
    fragment BadgeDetailFragment on badges {
        ...BadgeFragment
        metadata
        content
        value
        created_at
        badge_class {
            ...BadgeClassFragment
        }
        creator {
            ...ProfileFragment
        }
        owner {
            ...ProfileFragment
        }
}

${BADGE_FRAGMENT}
${PROFILE_FRAGMENT}
${BADGE_CLASS_FRAGMENT}
`

export const GET_BADGE_DETAIL_BY_BADGE_ID = gql`
    ${BADGE_DETAIL_FRAGMENT}
    query GetBadgeDetailByBadgeId($id: Int!) {
        badges(where: {id: {_eq: $id}}) {
            ...BadgeDetailFragment
        }
    }
`

export const GET_BADGE_BY_OWNER_HANDLE = gql`
    ${BADGE_FRAGMENT}
    query GetBadgeByOwnerHandle($handle: String!) {
        badges(where: {owner: {handle: {_eq: $handle}}}, order_by: {id: desc}) {
            ...BadgeFragment
        }
    }
`

export const GET_BADGE_AND_BADGE_CLASS_BY_OWNER_HANDLE = gql`
    ${BADGE_FRAGMENT}
    ${BADGE_CLASS_FRAGMENT}
    query GetBadgeAndBadgeClassByOwnerHandle($handle: String!) {
        badges(where: {owner: {handle: {_eq: $handle}}, status: {_eq: "accepted"}}, order_by: {id: desc}) {
            ...BadgeFragment
        }
        badge_classes(where: {creator: {handle: {_eq: $handle}}}, order_by: {id: desc}) {
            ...BadgeClassFragment
        }
    }
`