'use server'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {pickSearchParam} from "@/utils"

const api = process.env.NEXT_PUBLIC_API_URL

export interface IframeSchedulePageSearchParams {
    start_date: string | string[] | undefined
    tags: string | string[] | undefined
    track: string | string[] | undefined
    venue: string | string[] | undefined
    popup: string | string[] | undefined
}

export interface IframeSchedulePageParams {
    group: string
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
    tags: string[],
    external_url: null | string,
    host_info: string | null
    geo_lat: string | null,
    geo_lng: string | null,
}

export interface IframeSchedulePageData {
    group: IframeSchedulePageDataGroup
    tags: string[],
    venues: Solar.Venue[],
    tracks: Solar.Track[],
    events: IframeSchedulePageDataEvent[],
    interval: DayjsType[],
    filters: Filter,
    startDate?: string
}

export interface IframeSchedulePageDataProps {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams,
    view: 'week' | 'day',
}

export async function IframeSchedulePageData({params, searchParams, view}: IframeSchedulePageDataProps): Promise<IframeSchedulePageData> {
    const groupName = params.group
    const filters = {
        tags: searchParams.tags ? pickSearchParam(searchParams.tags)!.split(',') : [],
        trackId: searchParams.track ? Number(pickSearchParam(searchParams.track)!) : undefined,
        venueId: searchParams.venue ? Number(pickSearchParam(searchParams.venue)!) : undefined
    }
    const startDate = pickSearchParam(searchParams.start_date)

    const {start, end} = getInterval(startDate, view)

    const apiSearchParams = new URLSearchParams()
    apiSearchParams.set('group_id', groupName)
    apiSearchParams.set('start_date', start)
    apiSearchParams.set('end_date', end)
    apiSearchParams.set('limit', '200')

    filters.tags?.length && apiSearchParams.set('tags', filters.tags.join(','))
    filters.trackId && apiSearchParams.set('track_id', filters.trackId.toString())
    filters.venueId && apiSearchParams.set('venue_id', filters.venueId.toString())

    const url = `${api}/event/list_for_calendar?${apiSearchParams.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Fail to get schedule data: ' + response.statusText)
    }

    const data = await response.json()

    const interval = []
    let current = dayjs(start)
    while (current.isSameOrBefore(end)) {
        interval.push(current)
        current = current.add(1, 'day')
    }

    return {
        group: data.group,
        tags: data.group.event_tags || [],
        tracks: data.group.tracks || [],
        venues: data.group.venues || [],
        events: data.events || [],
        filters: filters,
        interval,
        startDate
    }
}

function getInterval(startDate?: string, view: 'week' | 'day' = 'week') {
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
    }
}

