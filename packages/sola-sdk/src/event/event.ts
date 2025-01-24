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
        variables: {handle}
    })

    return {
        attends: response.data.attends.map((a: { event: Event }) => a.event) as Event[],
        hosting: response.data.hosting as Event[],
        coHosting: response.data.coHosting.map((a: { event: Event }) => a.event) as Event[]
    }
}

export const getGroupEventByHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_GROUP_EVENT_BY_HANDLE,
        variables: {handle}
    })

    return response.data.events as Event[]
}

export const getEventIcsUrl = (groupHandle: string) => {
    const url = `${getSdkConfig().api}/group/icalendar?group_name=${groupHandle}`
    const googleCalendarLink = `https://www.google.com/calendar/render?cid=${encodeURIComponent(url.replace('https', 'http'))}`;
    const outlookCalendarLink = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(url)}`;
    const systemCalendarLink = url.replace('https', 'webcal')

    return {
        url,
        googleCalendarLink,
        outlookCalendarLink,
        systemCalendarLink
    }

}

export type EventCollectionType = "upcoming" | "past"

export type EventFilters = {
    groupId: number,
    timezone?: string,
    collection?: EventCollectionType
    isPrivate?: boolean,
    withStarStatus?: boolean,
    startDate?: string,
    endDate?: string,
    search?: string,
    tags?: string[],
    venueId?: number,
    trackId?: number,
    skipMultiDay?: boolean,
    skipRecurring?: boolean,
}

export type EventListFilterProps = {
    group_id: string,
    auth_token?: string,
    timezone?: string,
    collection: EventCollectionType,
    private_event?: string
    with_stars?: string,
    start_date?: string,
    end_date?: string,
    search_title?: string,
    tags?: string,
    venue_id?: string
    track_id?: string
    skip_multi_day?: string
    skip_recurring?: string
}

export const getEvents = async (filters: EventListFilterProps, authToken?: string) => {
    const searchParams = new URLSearchParams()
    for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
            const value = filters[key as keyof EventListFilterProps]
            if (value) {
                searchParams.append(key, value?.toString())
            }
        }
    }

    !!authToken && searchParams.append("auth_token", authToken)

    const url = `${getSdkConfig().api}/event/list?${searchParams.toString()}`
    console.log(url)
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Failed to fetch ${res.status}`)
    }

    const data = await res.json()

    return data.events as Event[]

}