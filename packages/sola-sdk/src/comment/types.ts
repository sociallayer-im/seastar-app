import {Profile, RemoteAuthor} from '../profile/types'

export type CommentItemType = 'Event' | 'Group'
export type CommentType = 'comment' | 'feedback' | 'star' | 'checkin' | 'chat'

/** soon CommentBlueprint — note the author is `user`, not `profile`. */
export interface Comment {
    id: string,
    title: string | null,
    item_type: CommentItemType,
    item_id: string,
    comment_type: CommentType,
    reply_parent_id: string | null,
    content: string | null,
    content_type: string,
    icon_url: string | null,
    created_at: string,
    /** null when the comment arrived over federation — see `remote_author`. */
    user: Profile | null,
    /**
     * Set instead of `user` for a federated comment. `acct` (name@server) is
     * what a reader needs — a remote display name alone looks local.
     */
    remote_author?: RemoteAuthor | null,
}
