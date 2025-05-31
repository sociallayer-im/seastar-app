'use server'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {CSSProperties} from 'react'
import {getLabelColor, getLightColor} from "@/utils/label_color"
import {IframeSchedulePageDataEvent} from "@/app/(iframe)/schedule/data_deprecated"


export interface ConcurrencyEvent extends IframeSchedulePageDataEvent {
    _previousConcurrentEvents: number | undefined
    _totalConcurrentEvents: number | undefined
}


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    style: CSSProperties
}

interface CalculateGridPositionProps {
    events: IframeSchedulePageDataEvent[],
    timezone: string,
    currDate: string
}

export async function calculateGridPosition({events, timezone, currDate}: CalculateGridPositionProps) {
    const currDateObj = dayjs.tz(currDate, timezone)

    const AllDayEvent: IframeSchedulePageDataEvent[] = []
    const otherEvents: IframeSchedulePageDataEvent[] = []

    events.forEach((event) => {
        const height = getDayViewEventHeight(event, currDateObj, timezone) + '%'
        if (height === '100%') {
            AllDayEvent.push(event)
        } else {
            otherEvents.push(event)
        }
    })


    const EventRes: IframeSchedulePageDataEventDetail[] = handleEventConcurrency(otherEvents.map(e => {
        return {...e, _previousConcurrentEvents: 0, _totalConcurrentEvents: 0}
    }) as ConcurrencyEvent[])
        .map((event) => {
            const leftPosition = getDayViewEventLeft(event)
            const eventWidth = 100 - leftPosition
            const labelColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
            const height = getDayViewEventHeight(event, currDateObj, timezone) + '%'

            return {
                ...event,
                style: {
                    backgroundColor: getLightColor(labelColor, 0.93),
                    height: height,
                    top: getDayViewEventTop(event, currDateObj, timezone) + '%',
                    left: leftPosition + '%',
                    width: eventWidth + '%'
                }
            }
        })

    return {
        events: EventRes,
        allDayEvents: AllDayEvent
    }
}


function handleEventConcurrency(
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

function getDayViewEventLeft(calendarEvent: ConcurrencyEvent) {
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

function getDayViewEventHeight(event: IframeSchedulePageDataEvent, currDate: DayjsType, timezone: string) {
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
        return index === 0 ? '00 AM' : dayjs().startOf('day').add(index, 'hour').format('hh A')
    })
}

