import {gql} from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'
import {BADGE_CLASS_FRAGMENT} from '../badge'
import {TRACK_FRAGMENT, GROUP_FRAGMENT} from '../group'

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
        email
        image_url
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
            email
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
        geo_lat
        geo_lng
        formatted_address
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

export const PAYMENT_METHOD_FRAGMENT = gql`
    fragment PaymentMethodFragment on payment_methods {
        id
        item_type
        item_id
        chain
        token_name
        token_address
        receiver_address
        price
        protocol
    }`

export const TICKET_FRAGMENT = gql`
    ${TRACK_FRAGMENT}
    ${BADGE_CLASS_FRAGMENT}
    ${PAYMENT_METHOD_FRAGMENT}
    fragment TicketFragment on tickets {
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
        status
        title
        ticket_type
        payment_metadata,
        payment_methods {
            ...PaymentMethodFragment
        }
    }`

export const EVENT_DETAIL_FRAGMENT = gql`
    ${EVENT_FRAGMENT}
    ${PARTICIPANT_FRAGMENT}
    ${TRACK_FRAGMENT}
    ${EVENT_ROLE_DETAIL_FRAGMENT}
    ${GROUP_FRAGMENT}
    ${BADGE_CLASS_FRAGMENT}
    ${TICKET_FRAGMENT}
    fragment EventDetailFragment on events {
        ...EventFragment
        recurring_id
        formatted_address
        geo_lat
        geo_lng
        content
        max_participant
        min_participant
        participants_count
        badge_class_id
        external_url
        requirement_tags
        notes
        extra
        operators
        group {
            ...GroupFragment
        }
        tickets {
            ...TicketFragment
        }
        location_data
        venue_id
        display
        participants (where: {status: {_neq: "cancelled"}}) {
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

export const GET_MAP_EVENTS_BY_GROUP_HANDLE = gql`
    ${EVENT_FRAGMENT}
    query GetMapEventsByGroupHandle($handle: String!, $now: timestamp!) {
        events(where: {
            display: {_neq: "private"},
            group: {handle: {_eq: $handle}}, 
            status: {_neq: "cancelled"},
            geo_lat: {_is_null: false},
            geo_lng: {_is_null: false}
            start_time: {_gte: $now}
            }, limit: 10, order_by: {start_time: asc}) {
                ...EventFragment
        }
    }
`


export const GET_EVENTS_BY_RECURRING_ID = gql`
    ${EVENT_FRAGMENT}
    query GetEventsByRecurringId($recurringId: Int!) {
        events(where: {recurring_id: {_eq: $recurringId}}) {
            ...EventFragment
        }
    }
`

export const GET_RECURRING_BY_ID = gql`
    query GetRecurringById($id: bigint!) {
        recurrings(where: {id: {_eq: $id}}) {
            id
            start_time
            end_time
            timezone
            interval
            event_count
        }
    }`