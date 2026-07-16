import {SolaSdkFunctionParams} from '../types'
import {request, Paginated} from '../request'
import {Comment, CommentItemType, CommentType} from './types'

export interface CreateCommentParams {
    title?: string
    content?: string
    itemType?: CommentItemType,
    comment_type: CommentType
    itemId: string
    replyParentId?: string | null
    authToken: string
}

export const createComment = async ({params, clientMode}: SolaSdkFunctionParams<CreateCommentParams>) => {
    return await request<Comment>('/comments', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {
            comment: {
                title: params.title,
                content: params.content,
                item_type: params.itemType,
                item_id: params.itemId,
                reply_parent_id: params.replyParentId,
                comment_type: params.comment_type,
                content_type: 'text'
            }
        }
    })
}

/**
 * List comments of an item. soon's comments#index currently requires auth —
 * pass authToken; anonymous comment reading needs a backend tweak if wanted.
 */
export const getCommentsByItemIdAndType = async ({params, clientMode}: SolaSdkFunctionParams<{
    itemId: string,
    itemType: CommentItemType,
    commentType: CommentType,
    authToken?: string
}>) => {
    const res = await request<Paginated<Comment>>('/comments', {
        clientMode,
        authToken: params.authToken,
        params: {
            comment_type: params.commentType,
            item_type: params.itemType,
            item_id: params.itemId
        },
        noCache: true
    })
    return res.data
}

/**
 * Star an item (idempotent).
 */
export const starComment = async ({params, clientMode}: SolaSdkFunctionParams<{
    itemId: string,
    itemType: CommentItemType,
    authToken: string
}>) => {
    await request('/comments/star', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {item_type: params.itemType, item_id: params.itemId}
    })
}

/**
 * Remove a star from an item.
 */
export const unstarComment = async ({params, clientMode}: SolaSdkFunctionParams<{
    itemId: string,
    itemType: CommentItemType,
    authToken: string
}>) => {
    await request('/comments/unstar', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {item_type: params.itemType, item_id: params.itemId}
    })
}

/**
 * Remove your own comment (soft delete).
 */
export const removeComment = async ({params, clientMode}: SolaSdkFunctionParams<{
    commentId: string,
    authToken: string
}>) => {
    await request(`/comments/${params.commentId}/remove`, {
        clientMode,
        method: 'POST',
        authToken: params.authToken
    })
}
