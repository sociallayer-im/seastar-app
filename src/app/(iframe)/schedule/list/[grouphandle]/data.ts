'use server'

import dayjs from "@/libs/dayjs"
import {IframeSchedulePageDataEvent} from "@/app/(iframe)/schedule/data"
import Dayjs from '@/libs/dayjs'


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    date: string
}

interface CalculateGridPositionProps {
    events: IframeSchedulePageDataEvent[],
    timezone: string,
    currentDate:string
}

export async function ListViewData({
    events,
    timezone,
}: CalculateGridPositionProps) {
    let dayEvents = [] as IframeSchedulePageDataEventDetail[]
    events.forEach(event => {
        const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)

        dayEvents.push({
            ...event,
            date: Dayjs.tz(new Date(event.start_time).getTime(), timezone).format('MMM DD')
        })
    })



    const groupedEventByStartDate = dayEvents
        .reduce((acc, event) => {
        if (!acc[event.date]) {
            acc[event.date] = []
        }
        acc[event.date].push(event)
        return acc
    }, {} as {[key: string]: IframeSchedulePageDataEventDetail[]})

    console.log(Object.keys(groupedEventByStartDate), timezone)

    return {
        groupedEventByStartDate
    }
}
