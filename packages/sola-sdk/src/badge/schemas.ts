import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'
import {GROUP_FRAGMENT} from '../group'

export const BADGE_CLASS_FRAGMENT = gql`
    fragment BadgeClassFragment on badge_classes {
        id
        title
        creator_id
        image_url
        display
        badge_type
        group_id
    }`

export const BADGE_CLASS_DETAIL_FRAGMENT = gql`
    ${PROFILE_FRAGMENT}
    ${GROUP_FRAGMENT}
    fragment BadgeClassDetailFragment on badge_classes {
        ...BadgeClassFragment
        metadata
        content
        transferable
        permissions
        created_at
        group {
            ...GroupFragment
        }
        creator {
          ...ProfileFragment
        }
        badges {
            id
            image_url
            title
            owner_id
            creator_id
            created_at
            content
            display
            owner {
                ...ProfileFragment
            }
        }
    }
     ${BADGE_CLASS_FRAGMENT}
     ${PROFILE_FRAGMENT}
`

export const GET_BADGE_CLASS_DETAIL_BY_BADGE_CLASS_ID = gql`
    ${BADGE_CLASS_DETAIL_FRAGMENT}
    query GetBadgeClassDetailByBadgeClassId($id: bigint!) {
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
    ${PROFILE_FRAGMENT}
    fragment BadgeFragment on badges {
        id
        image_url
        title
        owner_id
        creator_id
        created_at
        display
        voucher_id
        content
        badge_class {
            ...BadgeClassFragment
        }
        owner {
            ...ProfileFragment
        }
    }`


export const BADGE_DETAIL_FRAGMENT = gql`
    fragment BadgeDetailFragment on badges {
        ...BadgeFragment
        metadata
        value
        badge_class {
            ...BadgeClassDetailFragment
        }
        creator {
            ...ProfileFragment
        }
    }

    ${BADGE_FRAGMENT}
    ${PROFILE_FRAGMENT}
    ${BADGE_CLASS_DETAIL_FRAGMENT}
`

export const GET_BADGE_DETAIL_BY_BADGE_ID = gql`
    ${BADGE_DETAIL_FRAGMENT}
    query GetBadgeDetailByBadgeId($id: bigint!) {
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
        badges(where: {owner: {handle: {_eq: $handle}}, status: {_in: ["accepted", "minted"]}}, order_by: {id: desc}) {
            ...BadgeFragment
        }
        badge_classes(where: {creator: {handle: {_eq: $handle}}}, order_by: {id: desc}) {
            ...BadgeClassFragment
        }
    }
`

export const INVITE_FRAGMENT = gql`
    ${GROUP_FRAGMENT}
    fragment InviteFragment on group_invites {
        id
        sender_id
        receiver_id
        group_id
        expires_at
        badge_class_id
        created_at
        badge_id
        role
        status
        accepted
        message
        group {
            ...GroupFragment
        }
    }
`

export const INVITE_DETAIL_FRAGMENT = gql`
    ${INVITE_FRAGMENT}  
    ${PROFILE_FRAGMENT}  
    fragment InviteDetailFragment on group_invites {
        ...InviteFragment
        receiver_address_type
        receiver_address
        receiver {
            ...ProfileFragment
        }
        sender {
            ...ProfileFragment
        }
    }
`

export const GET_BADGE_CLASS_AND_INVITE_BY_GROUP_HANDLE = gql`
    ${BADGE_CLASS_FRAGMENT}
    ${INVITE_FRAGMENT}
    query GetBadgeClassAndInviteByGroupHandle($handle: String!, $now: timestamp!) {
        badge_classes(where: {group: {handle: {_eq: $handle}}}) {
            ...BadgeClassFragment
        }
        group_invites(where: {
            expires_at: {_gt: $now}, 
            group: {handle: {_eq: $handle}}} order_by: {id: desc}) {
            ...InviteFragment
        }
    }
`

export const GET_BADGE_CLASS_BY_GROUP_ID = gql`
    ${BADGE_CLASS_FRAGMENT}
    query GetBadgeClassAndInviteByGroupId($id: bigint!) {
        badge_classes(where: {group: {id: {_eq: $id}}}) {
            ...BadgeClassFragment
        }
    }
`

export const GET_INVITE_DETAIL_BY_ID = gql`
    ${INVITE_DETAIL_FRAGMENT}
    query GetInviteDetailById($id: bigint!) {
        group_invites(where: {id: {_eq: $id}}) {
            ...InviteDetailFragment
        }
    }
`

export const CHECK_BADGE_OWNERSHIP = gql`
    ${BADGE_FRAGMENT}
    query CheckBadgeOwnership($handle: String!, $badgeId: Int!) {
        badges(where: {owner: {handle: {_eq: $handle}}, badge_class_id: {_eq: $badgeId}}, order_by: {id: desc}) {
            ...BadgeFragment
        }
    }
`