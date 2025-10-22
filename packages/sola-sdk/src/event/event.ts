import {Event, EventDetail, EventDraftType, EventWithJoinStatus, Participant, Recurring} from './types'
import {getGqlClient, getSdkConfig} from '../client'
import {
    GET_EVENT_DETAIL_BY_ID,
    GET_GROUP_EVENT_BY_HANDLE,
    GET_MAP_EVENTS_BY_GROUP_HANDLE,
    GET_PROFILE_EVENTS_BY_HANDLE,
    GET_EVENTS_BY_RECURRING_ID, GET_RECURRING_BY_ID
} from './schemas'
import {fixDate} from '../uitls'
import dayjs from '@/libs/dayjs'
import {gql} from '@apollo/client'
import {SolaSdkFunctionParams} from '../types'

export const sortEventsByTime = (a: Event, b: Event): number => {
    const now = new Date().getTime()
    const aStartTime = new Date(a.start_time).getTime()
    const aEndTime = new Date(a.end_time).getTime()
    const bStartTime = new Date(b.start_time).getTime()
    const bEndTime = new Date(b.end_time).getTime()
    
    // 判断活动状态
    const aIsOngoing = aStartTime <= now && now <= aEndTime
    const bIsOngoing = bStartTime <= now && now <= bEndTime
    const aIsFuture = aStartTime > now
    const bIsFuture = bStartTime > now
    
    // 正在进行中的活动排在顶部
    if (aIsOngoing && !bIsOngoing) return -1
    if (!aIsOngoing && bIsOngoing) return 1
    
    // 如果都是正在进行中的活动，按开始时间升序排列
    if (aIsOngoing && bIsOngoing) {
        return aStartTime - bStartTime
    }
    
    // 未来活动排在已结束活动前面
    if (aIsFuture && !bIsFuture) return -1
    if (!aIsFuture && bIsFuture) return 1
    
    // 如果都是未来活动，按时间升序排列（早的在前）
    if (aIsFuture && bIsFuture) {
        return aStartTime - bStartTime
    }
    
    // 如果都是已结束活动，按结束时间降序排列（最近结束的在前）
    return bEndTime - aEndTime
}

export const getStaredEvent = async ({params: {authToken}, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    if (!authToken) {
        throw new Error('authToken is required')
    }

    const url = `${getSdkConfig(clientMode).api}/event/my_event_list?collection=my_stars&auth_token=${authToken}`
    try {
        const res = await fetch(url)
        if (!res.ok) {
            return []
        }

        const data = await res.json()
        return data.events.map((e: any) => {
            return {
                ...e,
                owner: e.profile,
                geo_lat: e.geo_lat ? Number(e.geo_lat) : null,
                geo_lng: e.geo_lng ? Number(e.geo_lng) : null,
            }
        }).reverse() as Event[]
    } catch (e: unknown) {
        console.error(e)
        return []
    }
}

export const getMyPendingApprovalEvent = async ({params: {authToken}, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    if (!authToken) {
        throw new Error('authToken is required')
    }

    
    const url = `${getSdkConfig(clientMode).api}/event/pending_approval_list?auth_token=${authToken}`
    try {
        const res = await fetch(url)
        if (!res.ok) {
            return []
        }

        const data = await res.json()
        return data.events
        .sort(sortEventsByTime)
        .slice(0, 30).map((e: any) => {
            return {
                ...e,
                owner: e.profile,
                geo_lat: e.geo_lat ? Number(e.geo_lat) : null,
                geo_lng: e.geo_lng ? Number(e.geo_lng) : null,
            }
        }) as Event[]
    } catch (e: unknown) {
        console.error(e)
        return []
    }
}

export const getProfileEventByHandle = async ({params: {handle}, clientMode}: SolaSdkFunctionParams<{
    handle: string
}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_PROFILE_EVENTS_BY_HANDLE,
        variables: {handle, now: new Date().toISOString()}
    })

    return {
        attends: response.data.attends
            .filter((a: { event?: Event }) => !!a.event)
            .map((a: { event: Event }) => fixDate(a.event))
            .sort(sortEventsByTime) as Event[],
        hosting: response.data.hosting
            .map((e: Event) => fixDate(e))
            .sort(sortEventsByTime) as Event[],
        coHosting: response.data.coHosting.map((a: { event: Event }) => fixDate(a.event))
            .sort(sortEventsByTime) as Event[],
        starred: response.data.starred
            .filter((a: { event?: Event }) => !!a.event)
            .map((a: { event: Event }) => fixDate(a.event))
            .sort(sortEventsByTime) as Event[],
    }

}

export const getGroupEventByHandle = async ({params: {handle}, clientMode}: SolaSdkFunctionParams<{
    handle: string
}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_GROUP_EVENT_BY_HANDLE,
        variables: {handle}
    })

    return response.data.events.map((e: Event) => fixDate(e)) as Event[]
}

export const getEventIcsUrl = ({params: {groupHandle}, clientMode}: SolaSdkFunctionParams<{ groupHandle: string }>) => {
    const nonce = new Date().getTime()
    const url = `${getSdkConfig(clientMode).api}/group/icalendar?group_name=${groupHandle}&nonce=${nonce}`
    const googleCalendarLink = `https://www.google.com/calendar/render?cid=${encodeURIComponent(url.replace('https', 'http'))}`
    const outlookCalendarLink = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(url)}`
    const systemCalendarLink = url.replace('https', 'webcal')

    return {
        url,
        googleCalendarLink,
        outlookCalendarLink,
        systemCalendarLink
    }

}

export type EventCollectionType = "upcoming" | "past" | undefined

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
    page?: number,
    pinned?: number,
    kind?: string
}

export const getEvents = async ({params: {filters, authToken, limit}, clientMode}: SolaSdkFunctionParams<{
    filters: EventListFilterProps,
    authToken?: string,
    page?: number,
    limit?: number
}>) => {
    const searchParams = new URLSearchParams()
    // searchParams.set('limit', '100')
    for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
            const value = filters[key as keyof EventListFilterProps]
            if (value) {
                searchParams.append(key, value?.toString())
            }
        }
    }

    if (authToken) {
        searchParams.set('with_stars', '1')
        searchParams.set('with_attending', '1')
        searchParams.set("auth_token", authToken)
    }

    if (limit) {
        searchParams.set('limit', limit.toString())
    } else {
        searchParams.set('limit', '100')
    }

    const url = `${getSdkConfig(clientMode).api}/api/event/list?${searchParams.toString()}`
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Failed to fetch ${res.status} url: ${url}`)
    }

    const data = await res.json()

    return data.events.map((e: any) => {
        return {
            ...e,
            geo_lat: e.geo_lat ? Number(e.geo_lat) : null,
            geo_lng: e.geo_lng ? Number(e.geo_lng) : null,
        }
    }) as EventWithJoinStatus[]
}

export const getEventDetailById = async ({params: {eventId}, clientMode}: SolaSdkFunctionParams<{
    eventId: number
}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_EVENT_DETAIL_BY_ID,
        variables: {id: eventId}
    })

    if (response.data.events.length === 0) {
        return null
    }

    if (response.data.events[0].tickets) {
        response.data.events[0].tickets = response.data.events[0].tickets.map((t: any) => {
            return {
                ...t,
                end_time: t.end_time ? t.end_time + 'Z' : null,
            }
        })
    }

    if (response.data.events[0].ticket_items) {
        response.data.events[0].ticket_items = response.data.events[0].ticket_items.map((t: any) => {
            return {
                ...t,
                create_at: t.create_at ? t.create_at + 'Z' : null,
            }
        })
    }

    return fixDate(response.data.events[0]) as EventDetail
}

export const sendEventFeedback = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: number,
    feedback: string,
    authToken: string
}>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/comment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: params.authToken,
            comment_type: 'feedback',
            item_type: 'Event',
            item_id: params.eventId,
            content: params.feedback
        })
    })

    if (!res.ok) {
        throw new Error('Failed to send feedback')
    }
}

export const attendEventWithoutTicket = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: number,
    authToken: string
}>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/event/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: params.eventId,
            auth_token: params.authToken
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

const buildSaveEventProps = (eventDraft: EventDraftType) => {
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

export const createEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventDraft: EventDraftType,
    authToken: string
}>) => {
    const eventProps = {
        auth_token: params.authToken,
        ...buildSaveEventProps(params.eventDraft),
        group_id: params.eventDraft.group_id,
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/event/create`, {
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
                                               params: {
                                                   startTime,
                                                   endTime,
                                                   timezone,
                                                   venueId,
                                                   excludeEventId
                                               }, clientMode
                                           }: SolaSdkFunctionParams<GetOccupiedTimeEventProps>) => {
    if (!venueId) return null

    const doc = gql`query MyQuery {
        events(where: {venue_id: {_eq: ${venueId}}, 
        status: {_neq: "cancelled"}${excludeEventId ? `,id: {_neq:${excludeEventId}}` : ''}}) {
            id
            title
            start_time
            end_time
        }
    }`

    const client = getGqlClient(clientMode)
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

export const createRecurringEvent = async ({params, clientMode}: SolaSdkFunctionParams<CreateRecurringEventParams>) => {
    const eventProps = {
        auth_token: params.authToken,
        event_count: params.eventCount,
        ...buildSaveEventProps(params.eventDraft),
        group_id: params.eventDraft.group_id,
        timezone: params.eventDraft.timezone,
        interval: params.interval,
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/recurring/create`, {
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

    return data.recurring as Recurring
}

export const updateEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventDraft: EventDraftType,
    authToken: string
}>) => {
    const eventProps = {
        auth_token: params.authToken,
        ...buildSaveEventProps(params.eventDraft),
        id: params.eventDraft.id,
    }

    if (params.eventDraft.badge_class_id) {
        const setBadge = await fetch(`${getSdkConfig(clientMode).api}/event/set_badge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: params.eventDraft.id,
                badge_class_id: params.eventDraft.badge_class_id,
                auth_token: params.authToken,
            })
        })

        if (!setBadge.ok) {
            throw new Error('Failed to set badge ' + 'code: ' + setBadge.status)
        }
        const badgeData = await setBadge.json()

        if (badgeData.result === 'error') {
            throw new Error(badgeData.message)
        }
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/event/update`, {
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

export const cancelEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: number,
    authToken: string
}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/event/unpublish`, {
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

export const cancelAttendEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: number,
    authToken: string
}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/event/cancel`, {
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

export const checkInEventForParticipant = async ({
                                                     params,
                                                     clientMode
                                                 }: SolaSdkFunctionParams<CheckInEventForParticipantParams>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/event/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: params.authToken,
            id: params.eventId,
            profile_id: params.participantProfileId
        })
    })

    if (!response.ok) {
        throw new Error('Failed to check in')
    }

    const data = await response.json()
    return data.participant as Participant
}

export const sendEventPoap = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: number,
    authToken: string
}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/event/send_badge`, {
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
        throw new Error('Failed to send poap')
    }
}

export const getMapEvents = async ({params: {groupHandle}, clientMode}: SolaSdkFunctionParams<{
    groupHandle: string
}>) => {
    const client = getGqlClient(clientMode)
    const now = dayjs().toISOString()
    const response = await client.query({
        query: GET_MAP_EVENTS_BY_GROUP_HANDLE,
        variables: {handle: groupHandle, now}
    })

    return response.data.events.map((e: Event) => fixDate(e)) as Event[]
}

export const getEventByRecurringId = async ({params: {recurringId}, clientMode}: SolaSdkFunctionParams<{
    recurringId: number
}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_EVENTS_BY_RECURRING_ID,
        variables: {recurringId}
    })

    return response.data.events
    .map((e: Event) => fixDate(e))
    .sort((a: Event, b: Event) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) as Event[]
}

export const getRecurringById = async ({params: {recurringId}, clientMode}: SolaSdkFunctionParams<{
    recurringId: number
}>) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_RECURRING_BY_ID,
        variables: {id: recurringId}
    })

    return response.data.recurrings[0] as Recurring || null
}

export type UpdateRecurringEventProps = {
    eventDraft: EventDraftType,
    recurringId: number,
    authToken: string,
    afterEventId?: number
    startTimeDiff: number
    endTimeDiff: number
}

export const updateRecurringEvent = async ({
                                               params: {
                                                   startTimeDiff,
                                                   endTimeDiff,
                                                   eventDraft,
                                                   recurringId,
                                                   afterEventId,
                                                   authToken
                                               }, clientMode
                                           }: SolaSdkFunctionParams<UpdateRecurringEventProps>) => {
    const props = {
        ...eventDraft,
        event_roles_attributes: eventDraft.event_roles || [],
        auth_token: authToken,
        recurring_id: recurringId,
        after_event_id: afterEventId,
        selector: afterEventId ? 'after' : 'all',
        start_time: undefined,
        end_time: undefined,
        start_time_diff: startTimeDiff,
        end_time_diff: endTimeDiff
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/recurring/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }
}

export type CancelRecurringEventProps = Omit<UpdateRecurringEventProps, 'eventDraft' | 'endTimeDiff' | 'startTimeDiff'>

export const cancelRecurringEvent = async ({
                                               params: {recurringId, afterEventId, authToken},
                                               clientMode
                                           }: SolaSdkFunctionParams<CancelRecurringEventProps>) => {
    const props = {
        auth_token: authToken,
        recurring_id: recurringId,
        event_id: afterEventId,
        selector: afterEventId ? 'after' : 'all',
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/recurring/cancel_event`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!response.ok) {
        throw new Error('Cancel failed')
    }
}

export const starEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{eventId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/comment/star`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item_id: eventId,
            auth_token: authToken,
            item_type:'Event'
        })
    })

    if (!response.ok) {
        throw new Error('Failed to star event')
    }
}

export const unstarEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{eventId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/comment/unstar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item_id: eventId,
            auth_token: authToken,
            item_type:'Event'
        })
    })

    if (!response.ok) {
        throw new Error('Failed to star event')
    }
}

export const approveEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{eventId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/event/approve_event`, {
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
        throw new Error('Failed to approve event')
    }
}

export const getProfileAttendedEvents = async ({params: {authToken}, clientMode}: SolaSdkFunctionParams<{authToken: string}>) => {
    const searchParams = new URLSearchParams()
    searchParams.set('with_stars', '1')
    searchParams.set('with_attending', '1')
    searchParams.set("auth_token", authToken)
    const url = `${getSdkConfig(clientMode).api}/api/event/my_attending?${searchParams.toString()}`
    // console.log('url', url)
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch profile attended events')
    }

    const data = await response.json()

    return data.events as EventWithJoinStatus[]

}


