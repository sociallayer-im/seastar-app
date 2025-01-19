import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'
import {GROUP_FRAGMENT} from '../group'

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

export const GET_PROFILE_EVENTS_BY_HANDLE = gql`
    ${EVENT_FRAGMENT}
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