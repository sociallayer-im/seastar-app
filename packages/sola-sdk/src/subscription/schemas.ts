import {gql} from '@apollo/client'
import {INVITE_DETAIL_FRAGMENT} from '../badge'
import {VOUCHER_FRAGMENT} from '../voucher'
import {ACTIVE_FRAGMENT} from '../activity/schemas'

export const SUBSCRIPTION_INVITE_SCHEMES = gql`
    ${INVITE_DETAIL_FRAGMENT}
    subscription ProfileInviteSubscription($profile_id: Int!, $addresses:[String!]!, $now: timestamp!) {
        invites: group_invites(where: {
            status: {_eq: "sending"}, 
            expires_at: {_gt: $now}, 
            _or: [
                {receiver_address: {_in: $addresses}}, 
                {receiver_id: {_eq: $profile_id}}
            ]
        }){
            ...InviteFragment
        }
    }
`

export const SUBSCRIPTION_VOUCHER_SCHEMES = gql`
    ${VOUCHER_FRAGMENT}
    subscription ProfileVoucherSubscription($profile_id: Int!, $addresses:[String!]!, $now: timestamp!) {
        vouchers: vouchers(where: {
            counter: {_neq: 0},
            expires_at: {_gt: $now},
            _or: [
                {receiver_address: {_in: $addresses}}, 
                {receiver_id: {_eq: $profile_id}}
            ]
        }){
            ...VoucherFragment
        }
    }`


export const SUBSCRIPTION_ACTIVES = gql`
    ${ACTIVE_FRAGMENT}
    subscription ActiveSubscription($profile_id: Int!) {
        activities: activities(where: {
            action: {_in: ["voucher/send_badge", "group_invite/send"]},
            receiver_id: {_eq: $profile_id},
            has_read: {_eq: false}
        }){
            ...ActiveFragment
        }
    }`