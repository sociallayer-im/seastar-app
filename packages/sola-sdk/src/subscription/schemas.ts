import {gql} from '@apollo/client'
import {INVITE_DETAIL_FRAGMENT} from '../badge'
import {VOUCHER_FRAGMENT} from '../voucher'

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

export const  SUBSCRIPTION_VOUCHER_SCHEMES = gql`
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