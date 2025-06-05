import {getGqlClient, getSdkConfig} from '../client'
import {SolaSdkFunctionParams} from '../types'
import {GET_PROFILE_ACTIVITIES} from './schemas'
import {ActivityDetail} from './types'

export const getProfileActivities = async ({params, clientMode}: SolaSdkFunctionParams<{ profile_id: number }>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_PROFILE_ACTIVITIES,
        variables: {profile_id: params.profile_id}
    })

    return response.data.activities as ActivityDetail[]
}

export const setActivityRead = async ({params, clientMode}: SolaSdkFunctionParams<{
    activityId: number,
    authToken: string
}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/activity/set_read_status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ids: [params.activityId],
            auth_token: params.authToken
        })
    })

    if (!response.ok) {
        throw new Error(`failed code: ${response.status}`)
    }
}