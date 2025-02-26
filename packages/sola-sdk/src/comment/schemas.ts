import { gql } from '@apollo/client'
import {PROFILE_FRAGMENT} from '../profile'

export const COMMENT_FRAGMENT = gql`
    ${PROFILE_FRAGMENT}
    fragment CommentFragment on comments {
        id
        title
        item_type
        item_id
        reply_parent_id
        content
        content_type
        profile_id
        removed
        comment_type
        created_at
        profile {
            ...ProfileFragment
        }
    }`

export const GET_COMMENTS_BY_ITEM_ID_AND_ITEM_TYPE = gql`
    ${COMMENT_FRAGMENT}
    query GetCommentsByItemIdAndItemType($item_id: Int!, $item_type: String!) {
        comments(where: {item_id: {_eq: $item_id}, item_type: {_eq: $item_type}}, order_by: {created_at: desc}) {
            ...CommentFragment
        }
    }
`