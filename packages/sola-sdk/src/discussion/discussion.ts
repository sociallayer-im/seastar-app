import {SolaSdkFunctionParams} from '../types'
import {request, Paginated} from '../request'
import {Category, Reply, Topic, TopicDetail, TopicDraft, TopicListFilter} from './types'

/**
 * The discussion boards on a group's event home.
 *
 * Two switches decide whether any of this answers at all: the deployment's
 * DISCUSSION_ENABLED and the group's own `discussion_enabled`. Either one off
 * and every endpoint here 404s — deliberately, so an unshipped feature looks
 * absent rather than forbidden. Callers should treat a 404 as "no forum here",
 * not as an error worth showing.
 */

/**
 * The boards this viewer may see, in display order.
 *
 * A private board is simply missing from the response rather than present and
 * marked — the server decides, and there is nothing to filter client-side.
 */
export const getCategories = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    authToken?: string,
}>) => {
    const res = await request<Paginated<Category>>('/categories', {
        params: {group_id: params.groupId, limit: 100},
        authToken: params.authToken,
        clientMode,
        // Which boards come back depends on who is asking, so this must never
        // be served from Next's fetch cache.
        noCache: true
    })
    return res.data
}

export const getTopics = async ({params, clientMode}: SolaSdkFunctionParams<{
    filters: TopicListFilter,
    authToken?: string,
}>) => {
    return await request<Paginated<Topic>>('/topics', {
        params: {...params.filters},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const getTopic = async ({params, clientMode}: SolaSdkFunctionParams<{
    topicId: string,
    authToken?: string,
}>) => {
    return await request<TopicDetail>(`/topics/${params.topicId}`, {
        authToken: params.authToken, clientMode, noCache: true
    })
}

export const getReplies = async ({params, clientMode}: SolaSdkFunctionParams<{
    topicId: string,
    page?: number,
    limit?: number,
    authToken?: string,
}>) => {
    return await request<Paginated<Reply>>(`/topics/${params.topicId}/replies`, {
        params: {page: params.page, limit: params.limit ?? 50},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const createTopic = async ({params, clientMode}: SolaSdkFunctionParams<{
    draft: TopicDraft,
    authToken: string,
}>) => {
    return await request<TopicDetail>('/topics', {
        method: 'POST', body: {topic: params.draft},
        authToken: params.authToken, clientMode
    })
}

export const updateTopic = async ({params, clientMode}: SolaSdkFunctionParams<{
    topicId: string,
    draft: Partial<TopicDraft>,
    authToken: string,
}>) => {
    return await request<TopicDetail>(`/topics/${params.topicId}`, {
        method: 'PATCH', body: {topic: params.draft},
        authToken: params.authToken, clientMode
    })
}

/** Soft delete — the topic becomes invisible to everyone, its author included. */
export const deleteTopic = async ({params, clientMode}: SolaSdkFunctionParams<{
    topicId: string,
    authToken: string,
}>) => {
    return await request(`/topics/${params.topicId}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}

/**
 * Manager actions on a topic. `flag` hides it from everyone but its author and
 * the managers, and the reason is shown to the author — hiding a post without
 * saying why is where moderation arguments start.
 */
export const topicAction = async ({params, clientMode}: SolaSdkFunctionParams<{
    topicId: string,
    action: 'pin' | 'unpin' | 'close' | 'open' | 'flag' | 'unflag' | 'restore',
    reason?: string,
    authToken: string,
}>) => {
    return await request(`/topics/${params.topicId}/${params.action}`, {
        method: 'POST',
        body: params.reason ? {reason: params.reason} : undefined,
        authToken: params.authToken, clientMode
    })
}

export const createReply = async ({params, clientMode}: SolaSdkFunctionParams<{
    topicId: string,
    content: string,
    replyToId?: string | null,
    authToken: string,
}>) => {
    return await request<Reply>(`/topics/${params.topicId}/replies`, {
        method: 'POST',
        body: {reply: {content: params.content, reply_to_id: params.replyToId ?? null}},
        authToken: params.authToken, clientMode
    })
}

export const deleteReply = async ({params, clientMode}: SolaSdkFunctionParams<{
    replyId: string,
    authToken: string,
}>) => {
    return await request(`/replies/${params.replyId}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}

export const replyAction = async ({params, clientMode}: SolaSdkFunctionParams<{
    replyId: string,
    action: 'flag' | 'unflag' | 'restore',
    reason?: string,
    authToken: string,
}>) => {
    return await request(`/replies/${params.replyId}/${params.action}`, {
        method: 'POST',
        body: params.reason ? {reason: params.reason} : undefined,
        authToken: params.authToken, clientMode
    })
}

/**
 * Starring, for both a topic and a reply.
 *
 * Stars are rows in the shared `comments` table keyed by item_type/item_id,
 * which is why one pair of functions covers both — and why the server has to
 * recompute the denormalised count after each call rather than the record
 * knowing about its own stars.
 *
 * Starring something already starred is idempotent, so a double click cannot
 * inflate the count.
 */
export const starDiscussionItem = async ({params, clientMode}: SolaSdkFunctionParams<{
    itemType: 'Topic' | 'Reply',
    itemId: string,
    authToken: string,
}>) => {
    await request('/comments/star', {
        method: 'POST',
        body: {item_type: params.itemType, item_id: params.itemId},
        authToken: params.authToken, clientMode
    })
}

export const unstarDiscussionItem = async ({params, clientMode}: SolaSdkFunctionParams<{
    itemType: 'Topic' | 'Reply',
    itemId: string,
    authToken: string,
}>) => {
    await request('/comments/unstar', {
        method: 'POST',
        body: {item_type: params.itemType, item_id: params.itemId},
        authToken: params.authToken, clientMode
    })
}

/** Board management. Deleting only works on an empty board — archive instead. */
export const createCategory = async ({params, clientMode}: SolaSdkFunctionParams<{
    draft: {group_id: string, name: string, slug?: string, summary?: string,
            sort?: number, visibility?: string},
    authToken: string,
}>) => {
    return await request<Category>('/categories', {
        method: 'POST', body: {category: params.draft},
        authToken: params.authToken, clientMode
    })
}

export const updateCategory = async ({params, clientMode}: SolaSdkFunctionParams<{
    categoryId: string,
    draft: {name?: string, slug?: string, summary?: string, sort?: number,
            archived?: boolean, visibility?: string},
    authToken: string,
}>) => {
    return await request<Category>(`/categories/${params.categoryId}`, {
        method: 'PATCH', body: {category: params.draft},
        authToken: params.authToken, clientMode
    })
}

export const deleteCategory = async ({params, clientMode}: SolaSdkFunctionParams<{
    categoryId: string,
    authToken: string,
}>) => {
    return await request(`/categories/${params.categoryId}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}
