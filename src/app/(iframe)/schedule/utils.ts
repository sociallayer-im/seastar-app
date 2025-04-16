import dayjs, {DayjsType} from "@/libs/dayjs"
import {getInterval, pickSearchParam} from "@/utils"
import {getSdkConfig, GroupDetail, Track} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

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
    group_id: number,
    host_info: {
        speaker?: Solar.ProfileSample[]
        co_host?: Solar.ProfileSample[]
        group_host?: Solar.ProfileSample[]
    } | null
    geo_lat: string | null,
    geo_lng: string | null,
    owner: Solar.ProfileSample,
    track_id: number | null,
    track: Solar.Track | null,
    recurring_id: number | null,
    pinned: boolean,
    event_roles: Solar.EventRole[] | null,
    location_data: string | null,
    is_attending: boolean
    is_starred: boolean
    is_owner: boolean
}

export interface IframeSchedulePageDataType {
    group: IframeSchedulePageDataGroup
    tags: string[],
    venues: Solar.Venue[],
    tracks: Solar.Track[],
    events: IframeSchedulePageDataEvent[],
    filters: Filter,
    weeklyUrl: string,
    dailyUrl: string,
    compactUrl: string,
    listingUrl: string,
    isFiltered: boolean,
    eventHomeUrl: string
    isIframe?: boolean
    currDate: string
}

export interface IframeSchedulePageDataProps {
    searchParams: IframeSchedulePageSearchParams,
    groupDetail: GroupDetail,
    view: 'week' | 'day' | 'list' | 'compact',
    authToken: string | null | undefined,
    currPath: string | null | undefined
}

function searchParamsToString(searchParams: IframeSchedulePageSearchParams, exclude: string[] = []): string {
    const params = new URLSearchParams()
    exclude = [...exclude, 'popup']

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

    const str = params.toString()

    return str ? '?' + str : ''
}

export async function IframeSchedulePageData({   searchParams,
                                                 groupDetail,
                                                 view,
                                                 authToken,
                                                 currPath
                                             }: IframeSchedulePageDataProps): Promise<IframeSchedulePageDataType> {
    const groupName = groupDetail.handle
    const filters: Filter = {
        tags: searchParams.tags ? pickSearchParam(searchParams.tags)!.split(',') : [],
        trackId: searchParams.track ? Number(pickSearchParam(searchParams.track)!) : undefined,
        venueId: searchParams.venue ? Number(pickSearchParam(searchParams.venue)!) : undefined,
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

    if (!!authToken) {
        apiSearchParams.set('auth_token', authToken)
        apiSearchParams.set('with_attending', '1')
        apiSearchParams.set('with_stars', '1')
    }

    const url = `${getSdkConfig(CLIENT_MODE).api}/api/event/list?${apiSearchParams.toString()}`
    // console.log('url =>', url)
    const response = await fetch(url, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Fail to get schedule data: ' + response.statusText + ' api: ' + url)
    }

    const data = await response.json()

    const intervelStart = dayjs.tz(start, groupDetail.timezone!).startOf('day')
    const intervelEnd = dayjs.tz(end, groupDetail.timezone!).endOf('day')

    // const interval = []
    // let current = dayjs.tz(start, groupDetail.timezone!)
    // while (current.isSameOrBefore(dayjs.tz(end, groupDetail.timezone!))) {
    //     interval.push(current.endOf('day'))
    //     current = current.add(1, 'day')
    // }

    let weeklyUrl = `/schedule/week/${groupName}${searchParamsToString(searchParams)}`
    let dailyUrl = `/schedule/day/${groupName}${searchParamsToString(searchParams)}`
    if (view === 'week' && dayjs.tz(new Date(), groupDetail.timezone!).isBetween(intervelStart, intervelEnd, 'day', '[]')) {
        // if current date is in the interval, set the daily view to the current date
        dailyUrl = `/schedule/day/${groupName}${searchParamsToString(searchParams, ['start_date'])}`
    }
    let listingUrl = `/schedule/list/${groupName}${searchParamsToString(searchParams)}`
    let compactUrl = `/schedule/compact/${groupName}${searchParamsToString(searchParams)}`


    const isIframe = !currPath?.includes('/event/')
    if (!isIframe) {
        // if not in iframe
        weeklyUrl = `/event/${groupName}/schedule/week${searchParamsToString(searchParams)}`
        dailyUrl = `/event/${groupName}/schedule/day${searchParamsToString(searchParams)}`
        if (view === 'week' && dayjs.tz(new Date(), groupDetail.timezone!).isBetween(intervelStart, intervelEnd, 'day', '[]')) {
            dailyUrl = `/event/${groupName}/schedule/day${searchParamsToString(searchParams, ['start_date'])}`
        }
        listingUrl = `/event/${groupName}/schedule/list${searchParamsToString(searchParams)}`
        compactUrl = `/event/${groupName}/schedule/compact${searchParamsToString(searchParams)}`
    }

    const events = data.events
        .filter((event: IframeSchedulePageDataEvent) => {
            return filters.applied ? event.is_attending : true;
        })
        .map((event: IframeSchedulePageDataEvent) => {
            return {
                ...event,
                track: groupDetail.tracks.find((track: Track) => track.id === event.track_id) || null
            }
        })

    const isFiltered = filters.tags.length > 0
        || !!filters.venueId
        || !!filters.trackId
        || filters.applied
        || filters.skipRecurring
        || filters.skipMultiDay


    const eventHomeUrl = `/event/${groupDetail.handle}`

    return {
        ...data,
        group: groupDetail,
        events,
        tags: groupDetail.event_tags || [],
        tracks: groupDetail.tracks || [],
        venues: groupDetail.venues || [],
        filters: filters,
        currDate: intervelStart.format('YYYY-MM-DD'),
        weeklyUrl,
        dailyUrl,
        listingUrl,
        compactUrl,
        isFiltered,
        eventHomeUrl,
        isIframe
    }
}