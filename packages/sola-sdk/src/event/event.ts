import {Event} from './types'
import {getGqlClient, getSdkConfig} from '../client'
import {GET_GROUP_EVENT_BY_HANDLE, GET_PROFILE_EVENTS_BY_HANDLE} from './schemas'

export const getStaredEvent = async (authToken: string) => {
    if (!authToken) {
        throw new Error('authToken is required')
    }

    const url = `${getSdkConfig().api}/event/my_event_list?collection=my_stars&auth_token=${authToken}`
    try {
        const res = await fetch(url)
        if (!res.ok) {
            return []
        }

        const data = await res.json()
        return data.events as Event[]
    } catch (e: unknown) {
        console.error(e)
        return []
    }
}

export const getProfileEventByHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_PROFILE_EVENTS_BY_HANDLE,
        variables: { handle }
    })

    return {
        attends: response.data.attends.map((a: {event: Event}) => a.event) as Event[],
        hosting: response.data.hosting as Event[],
    }
}

export const getGroupEventByHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_GROUP_EVENT_BY_HANDLE,
        variables: { handle }
    })

    return response.data.events as Event[]
}