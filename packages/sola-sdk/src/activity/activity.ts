import {request, Paginated} from '../request'
import {SolaSdkFunctionParams} from '../types'
import {ActivityDetail} from './types'

/**
 * Activities addressed to the current user (soon scopes by the token — the
 * old profile_id param is gone).
 */
export const getProfileActivities = async ({params, clientMode}: SolaSdkFunctionParams<{authToken: string}>) => {
    const res = await request<Paginated<ActivityDetail>>('/activities', {
        clientMode,
        authToken: params.authToken,
        params: {limit: 20},
        noCache: true
    })
    return res.data
}

export const setActivityRead = async ({params, clientMode}: SolaSdkFunctionParams<{
    activityId: string,
    authToken: string
}>) => {
    await request('/activities/mark_read', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {ids: [params.activityId]}
    })
}
