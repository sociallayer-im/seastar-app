import { gql } from '@apollo/client'
import {INVITE_DETAIL_FRAGMENT, BADGE_CLASS_FRAGMENT} from '../badge'
import {PROFILE_FRAGMENT} from '../profile'

export const ACTIVE_FRAGMENT= gql`
    fragment ActiveFragment on activities {
        id
        item_class_id
        item_id
        item_type
        data
        initiator_id
        receiver_id
        target_id
        target_type
        action
        has_read
        created_at
    }`

export const ACTIVE_DETAIL_FRAGMENT = gql`
    ${ACTIVE_FRAGMENT}
    ${INVITE_DETAIL_FRAGMENT}
    ${BADGE_CLASS_FRAGMENT}
    ${PROFILE_FRAGMENT}
    fragment ActiveDetailFragment on activities {
        ...ActiveFragment
        initiator {
           ...ProfileFragment
        }
        group_invite {
        ...InviteDetailFragment
        },
        badge_class {
        ...BadgeClassFragment
        }
    }`

export const GET_PROFILE_ACTIVITIES = gql`
    ${ACTIVE_DETAIL_FRAGMENT}
    query GetProfileActivities($profile_id: Int!) {
        activities(where: {receiver_id: {_eq: $profile_id}, action: {_in: ["voucher/send_badge", "group_invite/send"]}}, order_by: {created_at: desc}) {
            ...ActiveDetailFragment
        }
    }`
