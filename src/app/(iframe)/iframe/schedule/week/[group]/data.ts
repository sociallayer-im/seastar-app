'use server'

import dayjs, {DayjsType} from "@/libs/dayjs"

const api = process.env.NEXT_PUBLIC_API_URL

export interface IframeSchedulePageDataGroup {
    id: number,
    handle: string,
    timezone: string,
    nickname: string,
}

export interface IframeSchedulePageDataEvent {
    id: string,
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
    grid: string
    tagDisplayAmount: number
}

interface CalculateGridPositionProps {
    events: IframeSchedulePageDataEvent[],
    timezone: string,
    interval: DayjsType[]
}

export async function IframeSchedulePageWeeklyData(props: IframeSchedulePageDataProps): Promise<IframeSchedulePageData> {
    const {start, end} = getInterval(props.startDate)
    const url = `${api}/event/list_for_calendar?group_id=${props.groupName}&start_date=${start}&end_date=${end}&limit=200`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Fail to get schedule data: ' + response.statusText)
    }

    const data = await response.json()

    const interval = []
    let current = dayjs(start)
    while (current.isSameOrBefore(end)) {
        interval.push(current)
        current = current.add(1, 'day')
    }

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
        start: start.startOf('week').format('YYYY-MM-DD'),
        end: start.endOf('week').format('YYYY-MM-DD')
    }
}

export async function calculateGridPosition({events, timezone, interval}: CalculateGridPositionProps): Promise<IframeSchedulePageDataEventDetail[]> {
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

    return  res
}
