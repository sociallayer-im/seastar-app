'use server'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {pickSearchParam} from "@/utils"
import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {headers} from "next/headers"

const api = process.env.NEXT_PUBLIC_API_URL

export interface IframeSchedulePageSearchParams {
    start_date?: string | string[]
    tags?: string | string[]
    track?: string | string[]
    venue?: string | string[]
    popup?: string | string[]
    profile?: string | string[]
    applied?: string | string[],
    skip_repeat?: string | string[],
    skip_multi_day?: string | string[]
}

export interface IframeSchedulePageParams {
    grouphandle: string
}

export interface IframeSchedulePageDataGroup {
    id: number,
    handle: string,
    timezone: string,
    nickname: string,
    venues: Solar.Venue[],
    tracks: Solar.Track[],
}

export interface Filter {
    tags: string[]
    venueId?: number
    trackId?: number
    profileId?: number
    applied?: boolean
    skipRecurring?: boolean
    skipMultiDay?: boolean
}

export interface IframeSchedulePageDataEvent {
    id: number,
    title: string,
    start_time: string,
    end_time: string,
    timezone: string,
    meeting_url: null | string,
    location: string,
    cover_url: string,
    tags: string[] | null,
    external_url: null | string,
    host_info: {
        speaker?: Solar.ProfileSample[]
        co_host?: Solar.ProfileSample[]
        group_host?: Solar.ProfileSample[]
    } | null
    geo_lat: string | null,
    geo_lng: string | null,
    profile: Solar.ProfileSample,
    track_id: number | null,
    track: Solar.Track | null,
    recurring_id: number | null,
    pinned: boolean,
    event_roles: Solar.EventRole[] | null,
    location_data: string | null,
}

export interface IframeSchedulePageData {
    group: IframeSchedulePageDataGroup
    tags: string[],
    venues: Solar.Venue[],
    tracks: Solar.Track[],
    events: IframeSchedulePageDataEvent[],
    interval: DayjsType[],
    filters: Filter,
    startDate?: string,
    weeklyUrl: string,
    dailyUrl: string,
    listingUrl: string,
    isFiltered: boolean,
    eventHomeUrl: string
}

export interface IframeSchedulePageDataProps {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams,
    view: 'week' | 'day' | 'list',
}

function searchParamsToString(searchParams: IframeSchedulePageSearchParams, exclude: string[] = []) {
    const params = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
        if (exclude.includes(key)) {
            return
        }
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
        } else {
            params.set(key, value)
        }
    })

    return params.toString()
}

export async function IframeSchedulePageData({
    params,
    searchParams,
    view,
}: IframeSchedulePageDataProps): Promise<IframeSchedulePageData> {
    const groupName = params.grouphandle
    const filters: Filter = {
        tags: searchParams.tags ? pickSearchParam(searchParams.tags)!.split(',') : [],
        trackId: searchParams.track ? Number(pickSearchParam(searchParams.track)!) : undefined,
        venueId: searchParams.venue ? Number(pickSearchParam(searchParams.venue)!) : undefined,
        profileId: searchParams.profile ? Number(pickSearchParam(searchParams.profile)!) : undefined,
        applied: searchParams.applied === 'true',
        skipRecurring: searchParams.skip_repeat === 'true',
        skipMultiDay: searchParams.skip_multi_day === 'true'
    }
    const startDate = pickSearchParam(searchParams.start_date)

    const {start, end} = getInterval(startDate, view)

    const apiSearchParams = new URLSearchParams()
    apiSearchParams.set('group_id', groupName)
    apiSearchParams.set('start_date', start)
    apiSearchParams.set('end_date', end)
    apiSearchParams.set('limit', '400')
    filters.tags?.length && apiSearchParams.set('tags', filters.tags.join(','))
    filters.trackId && apiSearchParams.set('track_id', filters.trackId.toString())
    filters.venueId && apiSearchParams.set('venue_id', filters.venueId.toString())
    filters.profileId && apiSearchParams.set('source_profile_id', filters.profileId.toString())
    filters.applied && apiSearchParams.set('my_event', '1')
    filters.skipRecurring && apiSearchParams.set('skip_recurring', '1')
    filters.skipMultiDay && apiSearchParams.set('skip_multiday', '1')

    const url = `${api}/event/list?${apiSearchParams.toString()}`
    // console.log(url)
    const response = await fetch(url, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Fail to get schedule data: ' + response.statusText)
    }

    const data = await response.json()

    // console.log('---events', data.events.length)

    const interval = []
    let current = dayjs.tz(start, data.group.timezone)
    while (current.isSameOrBefore(dayjs.tz(end, data.group.timezone))) {
        interval.push(current.endOf('day'))
        current = current.add(1, 'day')
    }

    let weeklyUrl = `/schedule/week/${groupName}?${searchParamsToString(searchParams)}`
    let dailyUrl = `/schedule/day/${groupName}?${searchParamsToString(searchParams)}`
    if (view === 'week' && dayjs.tz(new Date(), data.group.timezone).isBetween(interval[0], interval[interval.length - 1], 'day', '[]')) {
        // if current date is in the interval, set the daily view to the current date
        dailyUrl = `/schedule/day/${groupName}?${searchParamsToString(searchParams, ['start_date'])}`
    }
    let listingUrl = `/schedule/list/${groupName}?${searchParamsToString(searchParams)}`

    const headersList = await headers()
    const currPath = headersList.get('x-current-path')
    if (currPath?.includes('/event/')) {
        // if not in iframe
        weeklyUrl = `/event/${groupName}/schedule/week?${searchParamsToString(searchParams)}`
        dailyUrl = `/event/${groupName}/schedule/day?${searchParamsToString(searchParams)}`
        if (view === 'week' && dayjs.tz(new Date(), data.group.timezone).isBetween(interval[0], interval[interval.length - 1], 'day', '[]')) {
            dailyUrl = `/event/${groupName}/schedule/day?${groupName}?${searchParamsToString(searchParams, ['start_date'])}`
        }
        listingUrl = `/event/${groupName}/schedule/list?${searchParamsToString(searchParams)}`
    }

    const events = data.events
        .map((event: IframeSchedulePageDataEvent) => {
            return {
                ...event,
                track: data.group.tracks.find((track: Solar.Track) => track.id === event.track_id) || null
            }
        })

    const isFiltered = filters.tags.length > 0
        || !!filters.venueId
        || !!filters.trackId
        || filters.applied
        || filters.skipRecurring
        || filters.skipMultiDay


    const eventHomeUrl = `/event/${data.group.handle || data.group.username}`

    return {
        ...data,
        events,
        tags: data.group.event_tags || [],
        tracks: data.group.tracks || [],
        venues: data.group.venues || [],
        filters: filters,
        interval,
        startDate,
        weeklyUrl,
        dailyUrl,
        listingUrl,
        isFiltered,
        eventHomeUrl
    }
}

function getInterval(startDate?: string, view: 'week' | 'day' | 'list' = 'week') {
    const start = dayjs(startDate || undefined)

    switch (view) {
    case 'week':
        return {
            start: start.startOf('week').format('YYYY-MM-DD'),
            end: start.endOf('week').format('YYYY-MM-DD')
        }
    case 'day':
        return {
            start: start.format('YYYY-MM-DD'),
            end: start.format('YYYY-MM-DD')
        }
    case 'list':
        return {
            start: start.format('YYYY-MM-DD'),
            end: start.format('YYYY-MM-DD')
        }
    }
}
