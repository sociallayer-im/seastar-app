import dayjs from "@/libs/dayjs"
import {getInterval, pickSearchParam} from "@/utils"
import {GroupDetail, Track, EventRole, Profile, EventWithJoinStatus, EventTrackRef, EventVenueRef} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Venue, getEvents} from '@sola/sdk'
import { redirect } from "next/navigation"

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
    id: string,
    handle: string,
    timezone: string,
    nickname: string,
    venues: Venue[],
    tracks: Track[],
}

export interface Filter {
    tags: string[]
    venueId?: string
    trackId?: string
    profileId?: string
    applied?: boolean
    skipRecurring?: boolean
    skipMultiDay?: boolean
}

/**
 * The schedule views' event model, built from soon's EventWithJoinStatus
 * (location/cover/geo derived from `place`/`image_url`).
 */
export interface IframeSchedulePageDataEvent {
    id: string,
    title: string,
    start_time: string,
    end_time: string,
    timezone: string,
    meeting_url: null | string,
    location: string,
    cover_url: string,
    tags: string[] | null,
    external_url: null | string,
    group: {
        handle: string,
        id: string,
        nickname: string,
        timezone: string,
        username: string
    },
    geo_lat: string | null,
    geo_lng: string | null,
    owner: Profile,
    track_id: string | null,
    track: EventTrackRef | null,
    recurring_id: string | null,
    pinned: boolean,
    event_roles: EventRole[] | null,
    location_data: string | null,
    is_attending: boolean
    is_starred: boolean
    is_owner: boolean
    venue?: EventVenueRef | null
}

export interface IframeSchedulePageDataType {
    group: IframeSchedulePageDataGroup
    tags: string[],
    venues: Venue[],
    tracks: Track[],
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
    venueUrl: string
}

export interface IframeSchedulePageDataProps {
    searchParams: IframeSchedulePageSearchParams,
    groupDetail: GroupDetail,
    view: 'week' | 'day' | 'list' | 'compact' | 'venue',
    authToken: string | null | undefined,
    currPath: string | null | undefined
    /** See CalculateGridPositionProps.noCache — only pass false from a
     *  browser-side call. */
    noCache?: boolean
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
                                                 currPath,
                                                 noCache
                                             }: IframeSchedulePageDataProps): Promise<IframeSchedulePageDataType> {
    const groupName = groupDetail.name
    const filters: Filter = {
        tags: searchParams.tags ? pickSearchParam(searchParams.tags)!.split(',') : [],
        trackId: pickSearchParam(searchParams.track) || undefined,
        venueId: pickSearchParam(searchParams.venue) || undefined,
        applied: searchParams.applied === 'true',
        skipRecurring: searchParams.skip_repeat === 'true',
        skipMultiDay: searchParams.skip_multi_day === 'true'
    }
    const startDate = pickSearchParam(searchParams.start_date)
    const {start, end} = getInterval(startDate, view, groupDetail.timezone || undefined)

    const rawEvents = await getEvents({
        params: {
            filters: {
                group_id: groupName,
                start_date: start,
                end_date: end,
                timezone: groupDetail.timezone || undefined,
                tags: filters.tags?.length ? filters.tags : undefined,
                track_id: filters.trackId,
                venue_id: filters.venueId,
                skip_recurring: filters.skipRecurring ? 1 : undefined,
            },
            authToken: authToken || undefined,
            limit: 400,
            noCache
        },
        clientMode: CLIENT_MODE
    })

    const toScheduleEvent = (e: EventWithJoinStatus): IframeSchedulePageDataEvent => ({
        id: e.id,
        title: e.title,
        start_time: e.start_time,
        end_time: e.end_time,
        timezone: e.timezone || groupDetail.timezone || 'UTC',
        meeting_url: e.meeting_url,
        location: e.venue?.name || e.place?.name || '',
        cover_url: e.image_url || '',
        tags: e.tags,
        external_url: e.external_url,
        group: {
            handle: groupDetail.name,
            id: groupDetail.id,
            nickname: groupDetail.nickname || groupDetail.name,
            timezone: groupDetail.timezone || '',
            username: groupDetail.name
        },
        geo_lat: e.place?.latitude != null ? String(e.place.latitude) : null,
        geo_lng: e.place?.longitude != null ? String(e.place.longitude) : null,
        owner: e.owner,
        track_id: e.track?.id || null,
        track: e.track || null,
        recurring_id: e.recurring_id,
        pinned: e.pinned,
        // soon's list view doesn't embed event_roles — host chips render from owner.
        event_roles: null,
        location_data: e.place?.data?.place_id || null,
        is_attending: !!e.is_attending,
        is_starred: !!e.is_starred,
        is_owner: !!e.is_owner,
        venue: e.venue
    })

    const data = {events: rawEvents.map(toScheduleEvent)}

    const intervelStart = dayjs.tz(start, groupDetail.timezone!).startOf('day')
    const intervelEnd = dayjs.tz(end, groupDetail.timezone!).endOf('day')

    let weeklyUrl = `/schedule/week/${groupName}${searchParamsToString(searchParams)}`
    let dailyUrl = `/schedule/day/${groupName}${searchParamsToString(searchParams)}`
    if (view === 'week' && dayjs.tz(new Date(), groupDetail.timezone!).isBetween(intervelStart, intervelEnd, 'day', '[]')) {
        // if current date is in the interval, set the daily view to the current date
        dailyUrl = `/schedule/day/${groupName}${searchParamsToString(searchParams, ['start_date'])}`
    }
    let listingUrl = `/schedule/list/${groupName}${searchParamsToString(searchParams)}`
    let compactUrl = `/schedule/compact/${groupName}${searchParamsToString(searchParams)}`
    let venueUrl = `/schedule/venue/${groupName}`


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
        venueUrl = `/schedule/venue/${groupName}`
    }

    const isMultiDay = (event: IframeSchedulePageDataEvent) => {
        const tz = groupDetail.timezone || 'UTC'
        return !dayjs.tz(event.start_time, tz).isSame(dayjs.tz(event.end_time, tz), 'day')
    }

    const events = data.events
        .filter((event: IframeSchedulePageDataEvent) => {
            if (filters.applied && !event.is_attending) return false
            if (filters.skipMultiDay && isMultiDay(event)) return false
            return true
        })

        if (events.length === 0 && !startDate) {
           const now = dayjs.tz(new Date().getTime(), groupDetail.timezone || 'UTC').format('YYYY-MM-DD')
           // Only the first upcoming event's start_time is used (to build the
           // redirect URL) — limit: 1 instead of the default page size so this
           // unavoidably-sequential fallback query is as cheap as possible.
           const upcomingEvents = await getEvents({
            params: {
                filters: {
                    group_id: groupDetail.id,
                    timezone: groupDetail.timezone || undefined,
                    collection: 'upcoming',
                },
                limit: 1
            }, clientMode: CLIENT_MODE
           })
           if (upcomingEvents.length > 0) {
             const newStartDate = dayjs.tz(new Date(upcomingEvents[0].start_time).getTime(), groupDetail.timezone || 'UTC').format('YYYY-MM-DD')
             const redirectUrl = isIframe 
             ?  `/schedule/${view}/${groupName}?start_date=${newStartDate}`
             : `/event/${groupName}/schedule/${view}?start_date=${newStartDate}`
             redirect(redirectUrl)
           }
        }

    const isFiltered = filters.tags.length > 0
        || !!filters.venueId
        || !!filters.trackId
        || !!filters.applied
        || !!filters.skipRecurring
        || !!filters.skipMultiDay


    const eventHomeUrl = `/event/${groupDetail.name}`

    return {
        ...data,
        group: {
            id: groupDetail.id,
            handle: groupDetail.name,
            timezone: groupDetail.timezone || '',
            nickname: groupDetail.nickname || groupDetail.name,
            venues: groupDetail.venues || [],
            tracks: groupDetail.tracks || [],
        },
        events,
        tags: groupDetail.event_tag_list || [],
        tracks: groupDetail.tracks || [],
        venues: groupDetail.venues || [],
        filters: filters,
        currDate: startDate ? startDate : dayjs.tz(undefined, groupDetail.timezone || dayjs.tz.guess()).format('YYYY-MM-DD'),
        weeklyUrl,
        dailyUrl,
        listingUrl,
        compactUrl,
        isFiltered,
        eventHomeUrl,
        venueUrl,
        isIframe
    }
}