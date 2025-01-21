import {PROFILE_FRAGMENT} from '../profile'
import {BADGE_CLASS_FRAGMENT, BADGE_DETAIL_FRAGMENT} from '../badge'
import { gql } from '@apollo/client'

export const VOUCHER_FRAGMENT = gql`
    ${BADGE_CLASS_FRAGMENT}
    fragment VoucherFragment on vouchers {
        id
        sender_id
        badge_class_id
        counter
        expires_at
        created_at
        message
        strategy
        receiver_id
        badge_class {
            ...BadgeClassFragment
         }
    }`

export const VOUCHER_DETAIL_FRAGMENT = gql`
    ${PROFILE_FRAGMENT}
    ${BADGE_DETAIL_FRAGMENT}
    ${VOUCHER_FRAGMENT}
    fragment VoucherDetailFragment on vouchers {
        ...VoucherFragment
        sender {
            ...ProfileFragment
        }
        badges {
            ...BadgeDetailFragment
        }
    }`

export const GET_VOUCHER_DETAIL_BY_HANDLE = gql`
    ${VOUCHER_FRAGMENT}
    query GetVoucherByHandle($handle: String!, $expires_at: timestamp!) {
        vouchers(where: {
            expires_at: {_gt: $expires_at}, 
            counter: {_neq: 0}, 
            sender: {handle: {_eq: $handle}}
        }, order_by: {id: desc}) {
            ...VoucherFragment
        }
    }
`
export const GET_VOUCHER_DETAIL_BY_ID = gql`
    ${VOUCHER_DETAIL_FRAGMENT}
    query GetVoucherById($id: bigint!) {
        vouchers(where: {id: {_eq: $id}}) {
            ...VoucherDetailFragment
        }
    }
`
export const GET_GROUP_VOUCHER_BY_HANDLE = gql`
    ${VOUCHER_FRAGMENT}
    query GetGroupVoucherByHandle($handle: String!, $now: timestamp!) {
        vouchers(where: {
            expires_at: {_gt: $now}, 
            counter: {_neq: 0}, 
            badge_class: {group: {handle: {_eq: $handle}}}
        }, order_by: {id: desc}) {
            ...VoucherFragment
        }
    }
`

