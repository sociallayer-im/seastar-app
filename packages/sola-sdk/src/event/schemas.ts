import {gql} from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'
import {BADGE_CLASS_FRAGMENT} from '../badge'
import {TRACK_FRAGMENT, VENUE_FRAGMENT, GROUP_FRAGMENT} from '../group'

console.log('PROFILE_FRAGMENT', !!PROFILE_FRAGMENT)
console.log('GROUP_FRAGMENT', !!GROUP_FRAGMENT)
console.log('BADGE_CLASS_FRAGMENT', !!BADGE_CLASS_FRAGMENT)


export const EVENT_ROLE_FRAGMENT = gql`
    fragment EventRoleFragment on event_roles {
        id
        event_id
        item_id
        item_type
        nickname
        role
    }`

export const PARTICIPANT_FRAGMENT = gql`
    ${PROFILE_FRAGMENT}
    fragment ParticipantFragment on participants {
        id
        event_id
        profile_id
        role
        status
        created_at
        ticket_id
        payment_status
        profile {
            ...ProfileFragment
        }
    }`

export const EVENT_FRAGMENT = gql`
    ${PROFILE_FRAGMENT}
    ${EVENT_ROLE_FRAGMENT}
    fragment EventFragment on events {
        id
        title
        event_type
        start_time
        end_time
        timezone
        meeting_url
        location
        cover_url
        tags
        event_roles {
            ...EventRoleFragment
        }
        owner {
            ...ProfileFragment
        }
        group_id
        status
        track_id
        pinned
    }`

export const EVENT_ROLE_DETAIL_FRAGMENT = gql`
    ${EVENT_ROLE_FRAGMENT}
    ${EVENT_FRAGMENT}
    ${GROUP_FRAGMENT}
    ${PROFILE_FRAGMENT}
    fragment EventRoleDetailFragment on event_roles {
      ...EventRoleFragment 
      event {
        ...EventFragment
      }
      group {
        ...GroupFragment
      }
      profile {
        ...ProfileFragment
      }
    }`

export const GET_PROFILE_EVENTS_BY_HANDLE = gql`
    ${EVENT_FRAGMENT}
    ${EVENT_ROLE_DETAIL_FRAGMENT}
    query GetProfileEventsByHandle($handle: String!) {
        attends: participants(where: {
            status: {_neq: "cancel"}, 
            profile: {handle: {_eq: $handle}}, 
            event: {status: {_neq: "cancel"}}
            }, order_by: {id: desc}) {
                id
                event {
                    ...EventFragment
                }
        }
        hosting: events(where: {
            owner: {handle: {_eq: $handle}}, 
            status: {_neq: "cancel"}
            }, order_by: {id: desc}) {
                ...EventFragment
        }
        coHosting: event_roles(where: {
            role: {_eq: "co_host"},
            profile: {handle: {_eq: $handle}}
        }, order_by: {id: desc}) {
            event {
                ...EventFragment
             }
        }
    }
`

export const GET_GROUP_EVENT_BY_HANDLE = gql`
    ${EVENT_FRAGMENT}
    query GetGroupEventsByHandle($handle: String!) {
        events(where: {
            display: {_neq: "private"}
            group: {handle: {_eq: $handle}}, 
            status: {_neq: "cancel"}
            }, order_by: {id: desc}) {
                ...EventFragment
        }
    }
`



export const VENUE_DETAIL_FRAGMENT = gql`
    ${VENUE_FRAGMENT}
    fragment VenueDetailFragment on venues {
        ...VenueFragment
        location_data
        location
        about
        group_id
        owner_id
        created_at
        formatted_address
        geo_lat
        geo_lng
        start_date
        end_date
        timeslots
        link
        capacity
        overrides
        require_approval
        venue_timeslots
        venue_overrides
    }`

export const EVENT_DETAIL_FRAGMENT = gql`
    ${EVENT_FRAGMENT}
    ${PARTICIPANT_FRAGMENT}
    ${TRACK_FRAGMENT}
    ${EVENT_ROLE_DETAIL_FRAGMENT}
    ${GROUP_FRAGMENT}
    ${BADGE_CLASS_FRAGMENT}
    fragment EventDetailFragment on events {
        ...EventFragment
        formatted_address
        geo_lat
        geo_lng
        content
        max_participant
        min_participant
        participants_count
        badge_class_id
        external_url
        notes
        extra
        operators
        group {
            ...GroupFragment
        }
        tickets {
            id
            tracks_allowed
            check_badge_class_id
            check_badge_class {
                ...BadgeClassFragment
            }
            content
            created_at
            end_time
            event_id
            need_approval
            payment_chain
            payment_target_address
            payment_token_address
            payment_token_price
            payment_token_name
            quantity
        }
        location_data
        venue_id
        display
        participants {
            ...ParticipantFragment
        }
        track{
            ...TrackFragment
        }
        event_roles {
            ...EventRoleDetailFragment
        }
    }`

export const GET_EVENT_DETAIL_BY_ID = gql`
    ${EVENT_DETAIL_FRAGMENT}
    query GetEventDetailById($id: bigint!) {
        events(where: {id: {_eq: $id}}) {
            ...EventDetailFragment
        }
    }
`

