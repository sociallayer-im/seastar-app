import {Profile} from '../profile/types'

/** Who a board is visible to. Anything other than `public` shows a lock. */
export type CategoryVisibility = 'public' | 'member' | 'manager' | 'invited'

/** CategoryBlueprint. A board inside one group — never a site-wide taxonomy. */
export interface Category {
    id: string,
    group_id: string,
    name: string,
    slug: string,
    summary: string | null,
    sort: number,
    topics_count: number,
    archived: boolean,
    visibility: CategoryVisibility,
    created_at: string,
}

/** CategoryRefBlueprint — the shape embedded on a topic. */
export interface CategoryRef {
    id: string,
    name: string,
    slug: string,
    visibility: CategoryVisibility,
}

/**
 * TopicBlueprint (default view). `content` is absent here on purpose — the
 * list renders cards, and a page of full post bodies is a much larger
 * response. Fetch a topic to get it.
 */
export interface Topic {
    id: string,
    group_id: string,
    category_id: string,
    title: string,
    image_url: string | null,
    tags: string[],
    replies_count: number,
    stars_count: number,
    replied_at: string | null,
    created_at: string,
    updated_at: string,
    pinned: boolean,
    closed: boolean,
    flagged: boolean,
    /** Only ever populated for the author and for managers. */
    flag_reason: string | null,
    is_starred: boolean,
    user: Profile,
    last_reply_user: Profile | null,
    category: CategoryRef,
}

/** TopicBlueprint :detail — adds the body and what this viewer may do. */
export interface TopicDetail extends Topic {
    content: string | null,
    content_type: string,
    can_edit: boolean,
    can_manage: boolean,
}

/** ReplyRefBlueprint — the quoted reply shown above a reply that answers it. */
export interface ReplyRef {
    id: string,
    /** `flagged` means hidden; render a tombstone rather than the excerpt. */
    state: 'visible' | 'flagged',
    excerpt: string | null,
    user: Profile,
}

export interface Reply {
    id: string,
    topic_id: string,
    content: string,
    content_type: string,
    reply_to_id: string | null,
    reply_to: ReplyRef | null,
    flagged: boolean,
    flag_reason: string | null,
    created_at: string,
    updated_at: string,
    user: Profile,
    can_edit: boolean,
}

export type TopicCollection = 'latest' | 'newest' | 'unanswered'

export interface TopicListFilter {
    group_id: string,
    category_id?: string,
    category_slug?: string,
    tags?: string,
    search?: string,
    user_id?: string,
    starred_id?: string,
    collection?: TopicCollection,
    page?: number,
    limit?: number,
}

export interface TopicDraft {
    category_id: string,
    title: string,
    content?: string,
    image_url?: string | null,
    tags?: string[],
}
