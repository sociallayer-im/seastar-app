import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'
import {GROUP_FRAGMENT} from '../group'
import {BADGE_CLASS_FRAGMENT} from '../badge'

export const MARKER_FRAGMENT = gql`
    fragment MarkerFragment on markers {
        id
        owner_id
        group_id
        marker_type
        category
        pin_image_url
        cover_image_url
        title
        about
        link
        status
        location
        formatted_address
        geo_lat
        geo_lng
        location_data
        start_time
        end_time
        badge_class_id
        voucher_id
        map_checkins_count
        marker_state
    }
`;

export const MARKER_DETAIL_FRAGMENT = gql`
    ${MARKER_FRAGMENT}
    ${PROFILE_FRAGMENT}
    ${GROUP_FRAGMENT}
    ${BADGE_CLASS_FRAGMENT}
    fragment MarkerDetailFragment on markers {
        ...MarkerFragment
        group {
            ...GroupFragment
        }
        owner {
           ...ProfileFragment
        }
        badge_class {
            ...BadgeClassFragment
        }
    }
`;

export const GET_MARKERS_BY_GROUP_HANDLE_AND_CATEGORY = gql`
    ${MARKER_FRAGMENT}
    query GetMarkersByGroupHandle($handle: String!, $category: String!) {
        markers(where: {group: {handle: {_eq: $handle}}, category: {_eq: $category}},order_by: {id: desc}) {
            ...MarkerFragment
        }
    }
`;

export const GET_MARKERS_BY_GROUP_HANDLE = gql`
    ${MARKER_FRAGMENT}
    query GetMarkersByGroupHandle($handle: String!) {
        markers(where: {group: {handle: {_eq: $handle}}},order_by: {id: desc}) {
            ...MarkerFragment
        }
    }
`;

export const GET_MARKER_DETAIL_BY_ID = gql`
    ${MARKER_DETAIL_FRAGMENT}
    query GetMarkerDetailById($id: bigint!) {
        markers(where: {id: {_eq: $id}}) {
            ...MarkerDetailFragment
        }
    }
  `