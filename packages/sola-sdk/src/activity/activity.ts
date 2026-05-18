import {getSdkConfig} from '../client'
import {SolaSdkFunctionParams} from '../types'
import {ActivityDetail} from './types'

export const getProfileActivities = async ({params, clientMode}: SolaSdkFunctionParams<{ profile_id: number }>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/activity/list?profile_id=${params.profile_id}&limit=20`)
    const data = await resp.json()
    return data.activities as ActivityDetail[]
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