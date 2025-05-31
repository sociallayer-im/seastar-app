import dayjs, {DayjsType} from "@/libs/dayjs"
import { GroupDetail } from "@sola/sdk"
import { IframeSchedulePageData, IframeSchedulePageSearchParams, IframeSchedulePageDataEvent } from "../../utils"
import { getInterval, pickSearchParam } from "@/utils"


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    grid: string
    tagDisplayAmount: number
}

interface CalculateGridPositionProps {
    groupDetail: GroupDetail,
    searchParams: IframeSchedulePageSearchParams,
    currPath: string,
    authToken: string | null | undefined
}

export async function calculateGridPosition({
    groupDetail,
    searchParams,
    currPath,
    authToken
}: CalculateGridPositionProps) {
    const data = await IframeSchedulePageData({searchParams, groupDetail, authToken, currPath, view: 'week'})
    const timezone = groupDetail.timezone || 'UTC'

    const startDate = pickSearchParam(searchParams.start_date)
    const {start, end} = getInterval(startDate, 'week', groupDetail.timezone || undefined)
    
    const interval: DayjsType[] = []
    let current = dayjs.tz(start, groupDetail.timezone!)
    while (current.isSameOrBefore(dayjs.tz(end, groupDetail.timezone!))) {
        interval.push(current.endOf('day'))
        current = current.add(1, 'day')
    }
    const days = interval
    const dayEvents = [[], [], [], [], [], [], []] as IframeSchedulePageDataEvent[][]
    data.events.forEach(event => {
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
            const weekStart = interval[0].startOf('day')
            const weekEnd = interval[interval.length - 1]
            const start = dayjs.tz(Math.max(new Date(event.start_time).getTime(), weekStart.valueOf()), timezone)
            const end = dayjs.tz(Math.min(new Date(event.end_time).getTime(), weekEnd.valueOf()), timezone)
            const columnWidth = end.diff(start, 'day') + 1
            const columnStart = colIndex + 1
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

    return {
        events: res,
        data
    }
}
