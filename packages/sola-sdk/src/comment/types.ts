import {Profile} from '../profile/types'

export type CommentItemType = 'Event' | 'Group'
export type CommentType = 'comment' | 'feedback' | 'star'

export interface Comment {
    id: number,
    title: string,
    item_type: CommentItemType,
    item_id: number,
    comment_type: CommentType,
    reply_parent_id: number | null,
    content: string | null,
    content_type: string,
    profile_id: number,
    removed: boolean,
    created_at: string,
    profile: Profile,
}