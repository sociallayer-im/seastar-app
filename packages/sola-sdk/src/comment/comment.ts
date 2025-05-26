import {SolaSdkFunctionParams} from '../types'
import {CommentItemType, CommentType, getGqlClient, getSdkConfig} from '@sola/sdk'
import {GET_COMMENTS_BY_ITEM_ID_AND_ITEM_TYPE} from './schemas'
import {Comment} from './types'

export interface CreateCommentParams {
    title?: string
    content?: string
    itemType?: CommentItemType,
    comment_type: CommentType
    itemId: number
    replyParentId?: number | null
    authToken: string
}

export const createComment = async ({params, clientMode}: SolaSdkFunctionParams<CreateCommentParams>) => {
    const props = {
        auth_token: params.authToken,
        comment: {
            title: params.title,
            content: params.content,
            item_type: params.itemType,
            item_id: params.itemId,
            reply_parent_id: params.replyParentId,
            comment_type: params.comment_type,
            content_type: 'text/plain',
        }
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/comment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(props),
    })

    if (!res.ok) {
        throw new Error('Failed to create comment')
    }

    const data = await res.json()

    if (data.error) {
        throw new Error(data.message)
    }

    return data.comment as Comment
}

export const getCommentsByItemIdAndType = async ({params, clientMode}: SolaSdkFunctionParams<{itemId: number, itemType: CommentItemType, commentType: CommentType}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_COMMENTS_BY_ITEM_ID_AND_ITEM_TYPE,
        variables: {
            item_id: params.itemId,
            item_type: params.itemType,
            comment_type: params.commentType,
        },
    })

    return response.data.comments as Comment[]
}