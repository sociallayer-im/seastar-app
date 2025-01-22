import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'



export const GROUP_FRAGMENT = gql`
    fragment GroupFragment on groups {
        id
        handle
        image_url
        nickname
    }
`

export const MEMBERSHIP_FRAGMENT = gql`
    ${PROFILE_FRAGMENT}
    fragment MembershipFragment on memberships {
        id
        role
        status
        profile {
           ...ProfileFragment
        }
    }
`

export const MEMBERSHIP_DETAIL_FRAGMENT = gql`
    ${MEMBERSHIP_FRAGMENT}
    ${GROUP_FRAGMENT}
    fragment MembershipDetailFragment on memberships {
       ...MembershipFragment
         group {
              ...GroupFragment
         }
    }
`

export const GROUP_DETAIL_FRAGMENT = gql`
    fragment GroupDetailFragment on groups {
        ...GroupFragment
        about
        social_links
        location
        permissions
        status
        event_tags
        event_enabled
        can_publish_event
        can_join_event
        can_view_event
        map_enabled
        banner_link_url
        banner_image_url
        banner_text
        logo_url
        memberships_count
        events_count
        group_tags
        timezone
        main_event_id
        start_date
        end_date
        memberships{
           ...MembershipFragment
        }
    }
    ${GROUP_FRAGMENT}
    ${MEMBERSHIP_FRAGMENT}
`

export const GET_GROUP_DETAIL_BY_HANDLE = gql`
    ${GROUP_DETAIL_FRAGMENT}
    query GetGroupByHandle($handle: String!) {
        groups(where: {handle: {_eq: $handle}}, limit: 1) {
            ...GroupDetailFragment
        }
    }
`

export const GET_GROUP_DETAIL_BY_ID = gql`
    ${GROUP_DETAIL_FRAGMENT}
    query GetGroupByHandle($id: bigint!) {
        groups(where: {id: {_eq: $id}}, limit: 1) {
            ...GroupDetailFragment
        }
    }
`

export const GET_PROFILE_MEMBERSHIPS = gql`
    ${MEMBERSHIP_DETAIL_FRAGMENT}
    query GetProfileMemberships($handle: String!) {
        memberships(where: {
            group: {status: {_neq: "freezed"}},
            profile: {handle: {_eq: $handle}}
        }, order_by: {id: asc}) {
            ...MembershipDetailFragment
        }
    }
`

export const GET_PROFILE_GROUP = gql`
    ${GROUP_FRAGMENT}
    ${MEMBERSHIP_FRAGMENT}
    query GetProfileGroup($handle: String!) {
      groups(where: {
          status: {_neq: "freezed"}, 
              memberships: {
              role: {_in: ["owner", "member", "manager"]}, 
              profile: {handle: {_eq: $handle}}
          }
      }, 
      order_by: {id: asc}) {
        ...GroupFragment
        memberships (where: {role: {_eq: "owner"}}){
          ...MembershipFragment
        }
      }
    }
`

export const GET_MEMBERSHIP_BY_GROUP_ID = gql`
    ${MEMBERSHIP_FRAGMENT}
    query GetMembershipByGroupHandle($id: bigint!) {
        memberships(where: {
            group: {id: {_eq: $id}},
        }) {
            ...MembershipFragment
        }
    }
`

export const GET_AVAILABLE_BADGE_CLASS_CREATOR_GROUPS = gql`
    ${GROUP_FRAGMENT}
    query GetAvailableBadgeClassCreatorGroups($handle: String!) {
        groups(where: {
            status: {_neq: "freezed"}, 
            memberships: {
                role: {_in: ["owner", "manager", "issuer"]}, 
                profile: {handle: {_eq: $handle}}
            }
        }) {
            ...GroupFragment
        }
    }
`