'use server'

import dayjs from "@/libs/dayjs"
import {IframeSchedulePageDataEvent} from "@/app/(iframe)/schedule/data"


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    isAllDay: boolean,
    time: string
}

interface CalculateGridPositionProps {
    events: IframeSchedulePageDataEvent[],
    timezone: string,
    currentDate:string
}

export async function calculateGridPosition({
    events,
    timezone,
    currentDate
}: CalculateGridPositionProps): Promise<IframeSchedulePageDataEventDetail[]> {
    let dayEvents = [] as IframeSchedulePageDataEventDetail[]
    events.forEach(event => {
        const current = dayjs.tz(currentDate, timezone)
        const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
        const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
        const isAllDay = start.isBefore(current, 'day') && end.isAfter(current, 'day')

        dayEvents.push({
            ...event,
            isAllDay,
            time: start.format('HH:mm')
        })
    })

    // sort event, if is an all day event, put it at the first
    dayEvents = dayEvents.sort((a, b) => {
        if (a.isAllDay) {
            return -1
        } else if (b.isAllDay) {
            return 1
        } else {
            return a.start_time.localeCompare(b.start_time)
        }
    })

    return dayEvents
}
