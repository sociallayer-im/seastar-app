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
    const days = interval
    events.forEach(event => {
        const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
        const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
        const dayIndex = days.findIndex((day) => {
            return day.isBetween(start, end, 'day', '[]')
        })

        if (dayIndex !== -1) {
            dayEvents[dayIndex].push(event)
        }
    })

    const columnOccupation = [[], [], [], [], [], [], []] as number[][]
    const res: IframeSchedulePageDataEventDetail[] = []
    dayEvents.forEach((dayEvent, colIndex) => {
        dayEvent.forEach((event, rowIndex) => {
            const weekStart = interval[0]
            const weekEnd = interval[interval.length - 1]
            const start = dayjs.tz(Math.max(new Date(event.start_time).getTime(), weekStart.valueOf()), timezone)
            const end = dayjs.tz(Math.min(new Date(event.end_time).getTime(), weekEnd.valueOf()), timezone)
            const columnWidth = end.date() - start.date() + 1
            const columnStart = start.day()
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

            if (columnWidth > 1) {
                let count = 0
                while (count < columnWidth) {
                    columnOccupation[colIndex + count].push(rowStart)
                    count++
                }
            } else {
                columnOccupation[colIndex].push(rowStart)
            }
        })
    })

    return res
}
