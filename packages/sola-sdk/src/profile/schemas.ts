import { gql } from '@apollo/client'

export const PROFILE_FRAGMENT = gql`
    fragment ProfileFragment on profiles {
        id
        handle
        image_url
        nickname
        address
    }`

export const PROFILE_DETAIL_FRAGMENT = gql`
    fragment ProfileDetailFragment on profiles {
        ...ProfileFragment
        address
        email
        zupass
        status
        about
        location
        sol_address
        permissions
        social_links
        farcaster
    }
     ${PROFILE_FRAGMENT}
`
export const GET_PROFILE_BY_HANDLE = gql`
    ${PROFILE_DETAIL_FRAGMENT}
    query GetProfileByHandle($handle: String!) {
        profiles(where: {handle: {_eq: $handle}}) {
            ...ProfileDetailFragment
        }
        following_count: followings_aggregate(where: {source: {handle: {_eq: $handle}}}) {
          aggregate {
            count
          }
        }
        follower_count: followings_aggregate(where: {target: {handle: {_eq: $handle}}}) {
          aggregate {
            count
          }
        }
    }
`

export const GET_FOLLOWING_AND_FOLLOWER_BY_HANDLE = gql`
    ${PROFILE_FRAGMENT} 
    query GetFollowingAndFollowerByHandle($handle: String!) {
        profile: profiles(where: {handle: {_eq: $handle}}) {
            ...ProfileFragment
        }
        followings: followings(where: {source: {handle: {_eq: $handle}}}) {
          target {
            ...ProfileFragment
          }
        }
        followers: followings(where: {target: {handle: {_eq: $handle}}}) {
          source {
           ...ProfileFragment
          }
        }
    }
`

export const GET_PROFILE_BY_HANDLES_OR_ADDRESSES = gql`
    ${PROFILE_FRAGMENT}
    query GetProfileByHandles($handles: [String!]!) {
        handleResult: profiles(where: {handle: {_in: $handles}}) {
            ...ProfileFragment
        }
        addressResult: profiles(where: {address: {_in: $handles}}) {
            ...ProfileFragment
        }
    }
`

export const GET_PROFILE_BY_ID = gql`
    ${PROFILE_DETAIL_FRAGMENT}
    query GetProfileByHandle($id: bigint!) {
        profiles(where: {id: {_eq: $id}}) {
            ...ProfileDetailFragment
        }
        following_count: followings_aggregate(where: {source: {id: {_eq: $id}}}) {
          aggregate {
            count
          }
        }
        follower_count: followings_aggregate(where: {target: {id: {_eq: $id}}}) {
          aggregate {
            count
          }
        }
    }
`
