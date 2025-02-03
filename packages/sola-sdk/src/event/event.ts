import {Event, EventDetail, EventDraftType, Participant} from './types'
import {getGqlClient, getSdkConfig} from '../client'
import {GET_EVENT_DETAIL_BY_ID, GET_GROUP_EVENT_BY_HANDLE, GET_PROFILE_EVENTS_BY_HANDLE} from './schemas'
import {fixDate} from '../uitls'
import dayjs from '@/libs/dayjs'
import {gql} from '@apollo/client'

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
        attends: response.data.attends.map((a: { event: Event }) => fixDate(a.event)) as Event[],
        hosting: response.data.hosting.map((e: Event) => fixDate(e)) as Event[],
        coHosting: response.data.coHosting.map((a: { event: Event }) => fixDate(a.event)) as Event[]
    }
}

export const getGroupEventByHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_GROUP_EVENT_BY_HANDLE,
        variables: {handle}
    })

    return response.data.events.map((e: Event) => fixDate(e)) as Event[]
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
    // console.log(url)
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Failed to fetch ${res.status}`)
    }

    const data = await res.json()

    return data.events as Event[]
}

export const getEventDetailById = async (eventId: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_EVENT_DETAIL_BY_ID,
        variables: {id: eventId}
    })

    if (response.data.events.length === 0) {
        return null
    }

    return fixDate(response.data.events[0]) as EventDetail
}

export const sendEventFeedback = async (props: { eventId: number, feedback: string, authToken: string }) => {
    const res = await fetch(`${getSdkConfig().api}/comment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: props.authToken,
            comment_type: 'feedback',
            item_type: 'Event',
            item_id: props.eventId,
            content: props.feedback
        })
    })

    if (!res.ok) {
        throw new Error('Failed to send feedback')
    }
}

export const attendEventWithoutTicket = async (eventId: number, authToken: string) => {
    const res = await fetch(`${getSdkConfig().api}/event/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: eventId,
            auth_token: authToken
        })
    })

    if (!res.ok) {
        const data = await res.json()
        if (data.message) {
            throw new Error(data.message)
        } else {
            throw new Error('Failed to attend event')
        }
    }
}

const buildSaveEventProps = (eventDraft: EventDraftType)=> {
    return {
        ...eventDraft,
        event_roles_attributes: eventDraft.event_roles || [],
        tickets_attributes: eventDraft.tickets.map(t => {
            return {
                ...t,
                payment_methods_attributes: t.payment_methods || []
            }
        }) || [],
    }
}

export const createEvent = async (props: { eventDraft: EventDraftType, authToken: string }) => {
    const eventProps = {
        auth_token: props.authToken,
        group_id: props.eventDraft.group_id,
        event: buildSaveEventProps(props.eventDraft)
    }

    const response = await fetch(`${getSdkConfig().api}/event/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventProps)
    })

    if (!response.ok) {
        throw new Error('Create failed')
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }

    return data.event as Event
}

export type GetOccupiedTimeEventProps = {
    startTime: string,
    endTime: string,
    timezone: string,
    venueId: number | null,
    excludeEventId?: number
}

export const getOccupiedTimeEvent = async ({
                                               startTime,
                                               endTime,
                                               timezone,
                                               venueId,
                                               excludeEventId
                                           }: GetOccupiedTimeEventProps) => {
    if (!venueId) return null

    const doc = gql`query MyQuery {
        events(where: {venue_id: {_eq: ${venueId}}, 
        status: {_in: ["open", "published"]}${excludeEventId ? `,id: {_neq:${excludeEventId}}` : ''}}) {
            id
            title
            start_time
            end_time
        }
    }`

    const client = getGqlClient()
    const response = await client.query({
        query: doc
    })

    const events = response.data.events.map((e: Event) => fixDate(e)) as Event[]
    return events.find((e) => {
        const eventStartTime = new Date(e.start_time!).getTime()
        const eventEndTime = new Date(e.end_time!).getTime()
        const selectedStartTime = new Date(startTime).getTime()
        const selectedEndTime = new Date(endTime).getTime()
        const eventIsAllDay = dayjs.tz(eventStartTime, timezone).hour() === 0 && (eventEndTime - eventStartTime + 60000) % 8640000 === 0
        const selectedIsAllDay = dayjs.tz(selectedStartTime, timezone).hour() === 0 && (selectedEndTime - selectedStartTime + 60000) % 8640000 === 0
        return ((selectedStartTime < eventStartTime && selectedEndTime > eventStartTime) ||
                (selectedStartTime >= eventStartTime && selectedEndTime <= eventEndTime) ||
                (selectedStartTime < eventEndTime && selectedEndTime > eventEndTime)) &&
            (!eventIsAllDay && !selectedIsAllDay)
    }) || null
}

export interface CreateRecurringEventParams {
    eventDraft: EventDraftType,
    authToken: string,
    eventCount: number,
    interval: string,
}

export const createRecurringEvent = async (props: CreateRecurringEventParams) => {
    const eventProps = {
        auth_token: props.authToken,
        group_id: props.eventDraft.group_id,
        event_count: props.eventCount,
        timezone: props.eventDraft.timezone,
        interval: props.interval,
        event: buildSaveEventProps(props.eventDraft)
    }

    const response = await fetch(`${getSdkConfig().api}/recurring/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventProps)
    })

    if (!response.ok) {
        throw new Error('Create failed')
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }
}

export const updateEvent = async (props: { eventDraft: EventDraftType, authToken: string }) => {
    const eventProps = {
        auth_token: props.authToken,
        id: props.eventDraft.id,
        event: buildSaveEventProps(props.eventDraft)
    }

    const response = await fetch(`${getSdkConfig().api}/event/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventProps)
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }

    return data.event as Event
}

export const cancelEvent = async (eventId: number, authToken: string) => {
    const response = await fetch(`${getSdkConfig().api}/event/unpublish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: eventId,
            auth_token: authToken
        })
    })

    if (!response.ok) {
        throw new Error('Failed to cancel event')
    }

    const data = await response.json()
    if (data.result !== 'ok') {
        throw new Error(data.message)
    }
}

export const cancelAttendEvent = async (eventId: number, authToken: string) => {
    const response = await fetch(`${getSdkConfig().api}/event/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: eventId,
            auth_token: authToken
        })
    })

    if (!response.ok) {
        throw new Error('Failed to cancel attend event')
    }

    const data = await response.json()
    return data.participant as Participant
}

type CheckInEventForParticipantParams = {
    authToken: string,
    eventId: number,
    participantProfileId: number
}

export const checkInEventForParticipant = async (props: CheckInEventForParticipantParams) => {
    const response = await fetch(`${getSdkConfig().api}/event/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: props.authToken,
            id: props.eventId,
            profile_id: props.participantProfileId
        })
    })

    if (!response.ok) {
        throw new Error('Failed to check in')
    }

    const data = await response.json()
    return data.participant as Participant
}


