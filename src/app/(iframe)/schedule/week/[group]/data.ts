'use server'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {IframeSchedulePageDataEvent} from "@/app/(iframe)/schedule/data"


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    grid: string
    tagDisplayAmount: number
}

interface CalculateGridPositionProps {
    events: IframeSchedulePageDataEvent[],
    timezone: string,
    interval: DayjsType[]
}

export async function calculateGridPosition({
    events,
    timezone,
    interval
}: CalculateGridPositionProps): Promise<IframeSchedulePageDataEventDetail[]> {
    const dayEvents = [[], [], [], [], [], [], []] as IframeSchedulePageDataEvent[][]
    const days = Array.from({length: 7}, (_, i) => {
        return interval[0].add(i, 'day')
    })

    events.forEach(event => {
        const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
        const dayIndex = days.findIndex((day) => {
            return day.year() === start.year() && day.month() === start.month() && day.date() === start.date()
        })

        if (dayIndex !== -1) {
            dayEvents[dayIndex].push(event)
        }
    })

    const columnOccupation = [[], [], [], [], [], [], []] as number[][]
    const res: IframeSchedulePageDataEventDetail[] = []

    dayEvents.forEach((dayEvent, colIndex) => {
        dayEvent.forEach((event, rowIndex) => {
            const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
            const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
            const columnWidth = Math.min(end.date() - start.date(), 6 - colIndex) + 1
            const columnStart = start.day() || 7
            let rowStart = rowIndex + 1
            while (columnOccupation[colIndex].includes(rowStart)) {
                // 检查是否有重叠，若重叠往下移动
                rowStart++
            }
            const gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + columnWidth}`
            const tagDisplayAmount = columnWidth > 2 ? 3 : 1
            res.push({
                ...event,
                grid: gridArea,
                tagDisplayAmount,
            })
        })
    })

    return res
}
