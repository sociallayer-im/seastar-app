'use server'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {CSSProperties} from 'react'
import {getLabelColor, getLightColor} from "@/utils/label_color"

const api = process.env.NEXT_PUBLIC_API_URL

export interface IframeSchedulePageDataGroup {
    id: number,
    handle: string,
    timezone: string,
    nickname: string,
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

export interface ConcurrencyEvent extends IframeSchedulePageDataEvent {
    _previousConcurrentEvents: number | undefined
    _totalConcurrentEvents: number | undefined
}

export interface IframeSchedulePageData {
    group: IframeSchedulePageDataGroup
    tags: string[],
    tracks: string[],
    venues: string[],
    events: IframeSchedulePageDataEvent[],
    interval: DayjsType[]
}

export interface IframeSchedulePageDataProps {
    groupName: string,
    startDate?: string
}

export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    style: CSSProperties
}

interface CalculateGridPositionProps {
    events: IframeSchedulePageDataEvent[],
    timezone: string,
    currDate: string
}

export async function iframeSchedulePageDailyData(props: IframeSchedulePageDataProps): Promise<IframeSchedulePageData> {
    const {start} = getInterval(props.startDate)
    const url = `${api}/event/list_for_calendar?group_id=${props.groupName}&start_date=${start}&end_date=${start}&limit=200`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Fail to get schedule data: ' + response.statusText)
    }

    const data = await response.json()

    const interval = [dayjs(start)]

    return {
        group: data.group,
        tags: data.group.event_tags || [],
        tracks: data.group.tracks || [],
        venues: data.group.venues || [],
        events: data.events || [],
        interval
    }
}

function getInterval(startDate?: string) {
    const start = dayjs(startDate || undefined)

    return {
        start: start.startOf('day').format('YYYY-MM-DD'),
    }
}

export async function calculateGridPosition({events, timezone, currDate}: CalculateGridPositionProps) {
    const eventConcurrent = handleEventConcurrency(events.map(e => {
        return {...e, _previousConcurrentEvents: 0, _totalConcurrentEvents: 0}}) as ConcurrencyEvent[])

    const currDateObj = dayjs.tz(currDate, timezone)
    const res : IframeSchedulePageDataEventDetail[] =[]
    eventConcurrent.forEach((event) => {
        const leftPosition = getDayViewEventLeft(event)
        const eventWidth = 100 - leftPosition
        const labelColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
        res.push({
            ...event,
            style: {
                backgroundColor: getLightColor(labelColor, 0.93),
                height: getDayViewEventHeight(event, currDateObj, timezone) + '%',
                top: getDayViewEventTop(event, currDateObj, timezone) + '%',
                left: leftPosition + '%',
                width: eventWidth + '%'
            }
        })
    })

    return res
}


function handleEventConcurrency (
    sortedEvents: ConcurrencyEvent[],
    concurrentEventsCache: ConcurrencyEvent[] = [],
    currentIndex = 0
): ConcurrencyEvent[] {
    for (let i = currentIndex; i < sortedEvents.length; i++) {
        const event = sortedEvents[i]
        const nextEvent = sortedEvents[i + 1]

        if (
            concurrentEventsCache.length &&
            (!nextEvent ||
                concurrentEventsCache.every((e) => e.end_time < nextEvent.start_time))
        ) {
            concurrentEventsCache.push(event)

            for (let ii = 0; ii < concurrentEventsCache.length; ii++) {
                const currentEvent = concurrentEventsCache[ii]
                const NpreviousConcurrentEvents = concurrentEventsCache.filter(
                    (cachedEvent, index) => {
                        if (cachedEvent === currentEvent || index > ii) return false

                        return (
                            cachedEvent.start_time <= currentEvent.start_time &&
                            cachedEvent.end_time > currentEvent.end_time
                        )
                    }
                ).length
                const NupcomingConcurrentEvents = concurrentEventsCache.filter(
                    (cachedEvent, index) => {
                        if (cachedEvent === currentEvent || index < ii) return false

                        return (
                            cachedEvent.start_time < currentEvent.end_time &&
                            cachedEvent.end_time >= currentEvent.start_time
                        )
                    }
                ).length


                currentEvent._totalConcurrentEvents =
                    NpreviousConcurrentEvents + NupcomingConcurrentEvents + 1
                currentEvent._previousConcurrentEvents = NpreviousConcurrentEvents
            }
            concurrentEventsCache = []
            return handleEventConcurrency(sortedEvents, concurrentEventsCache, i + 1)
        }

        if (
            (nextEvent && event.end_time > nextEvent.start_time) ||
            concurrentEventsCache.some((e) => e.end_time > event.start_time)
        ) {
            concurrentEventsCache.push(event)
            return handleEventConcurrency(sortedEvents, concurrentEventsCache, i + 1)
        }
    }

    return sortedEvents
}

function getDayViewEventLeft (calendarEvent: ConcurrencyEvent) {
    if (
        !calendarEvent._totalConcurrentEvents ||
        !calendarEvent._previousConcurrentEvents
    )
        return 0

    return (
        ((calendarEvent._previousConcurrentEvents || 0) /
            (calendarEvent._totalConcurrentEvents || 0)) *
        100
    )
}

function getDayViewEventHeight(event: IframeSchedulePageDataEvent,  currDate: DayjsType, timezone: string) {
    let start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    // 处理开始时间不是在当天的情况
    if (start.date() !== currDate.date()) {
        start = currDate.startOf('day')
    }
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const totalMinutes = end.diff(start, 'minute')
    const startTimeMinutes = start.hour() * 60 + start.minute()
    // 处理结束时间不是在当天的情况
    return Math.min((1440 - startTimeMinutes) / 1440, totalMinutes / 1440) * 100 + ''
}

function getDayViewEventTop(event: IframeSchedulePageDataEvent, currDate: DayjsType, timezone: string) {
    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    if (start.date() !== currDate.date()) {
        return 0
    }
    const minutes = start.hour() * 60 + start.minute()
    return minutes / 1440 * 100 + ''
}

export async function getHourLabel() {
    return new Array(24).fill('').map((_, index) => {
        return dayjs().startOf('day').add(index, 'hour').format('hh A')
    })
}

