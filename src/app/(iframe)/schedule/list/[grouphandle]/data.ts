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

export async function ListViewData({
    events,
    timezone,
    currentDate
}: CalculateGridPositionProps) {
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


    const allDayEvents = dayEvents.filter(event => event.isAllDay)

    const groupedEventByStartTime = dayEvents
        .filter(e => !e.isAllDay)
        .reduce((acc, event) => {
        if (!acc[event.start_time]) {
            acc[event.start_time] = []
        }
        acc[event.start_time].push(event)
        return acc
    }, {} as {[key: string]: IframeSchedulePageDataEventDetail[]})

    return {
        allDayEvents,
        groupedEventByStartTime
    }
}
