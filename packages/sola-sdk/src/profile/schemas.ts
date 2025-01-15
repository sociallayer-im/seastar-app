import { gql } from '@apollo/client'

export const PROFILE_FRAGMENT = gql`
    fragment ProfileFragment on Profile {
        id
        handle
        image_url
        nickname
    }`

export const PROFILE_DETAIL_FRAGMENT = gql`
    fragment ProfileDetailFragment on ProfileDetail {
        ...ProfileFragment
        address
        email
        phone
        zupass
        status
        about
        location
        sol_address
        farcaster_fid
        farcaster_address
        extras
        permissions
    }
     ${PROFILE_FRAGMENT}
`
export const GET_PROFILE_BY_HANDLE = gql`
    query GetProfileByHandle($handle: String!) {
        profiles:profiles(where: {handle: {_eq: $handle}}) {
            ...ProfileDetailFragment
        }
        following_count:followings_aggregate(where: {source: {handle: {_eq: $handle}}}) {
          aggregate {
            count
          }
        }，
        follower_count:followings_aggregate(where: {target: {handle: {_eq: $handle}}}) {
          aggregate {
            count
          }
        }
    }
    ${PROFILE_DETAIL_FRAGMENT}
`
