import dayjs from "@/libs/dayjs"
import {IframeSchedulePageData, IframeSchedulePageDataEvent, IframeSchedulePageSearchParams} from "@/app/(iframe)/schedule/utils"
import { GroupDetail } from "@sola/sdk"
import { getInterval, pickSearchParam } from "@/utils"


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    isAllDay: boolean,
    timeStr: string,
    endTimeStr: string
}

interface CalculateGridPositionProps {
    groupDetail: GroupDetail,
    searchParams: IframeSchedulePageSearchParams,
    currPath: string,
    authToken: string | null | undefined
    /** Only meaningful client-side (a browser fetch, never touched by
     *  Next.js's server fetch cache) — pass false from a filter change to let
     *  soon's own Cache-Control govern via standard HTTP caching. Leave
     *  default (true) for the server-rendered initial load. */
    noCache?: boolean
}

export async function calculateGridPosition({
    groupDetail,
    searchParams,
    currPath,
    authToken,
    noCache
}: CalculateGridPositionProps) {
    const data = await IframeSchedulePageData({searchParams, groupDetail, authToken, currPath, view: 'compact', noCache})
    const timezone = groupDetail.timezone || 'UTC'

    let dayEvents = [] as IframeSchedulePageDataEventDetail[]
    data.events.forEach(event => {
        const current = dayjs.tz(data.currDate, timezone)
        const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
        const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
        const isAllDay = start.isBefore(current, 'day') && end.isAfter(current, 'day')

        dayEvents.push({
            ...event,
            isAllDay,
            timeStr: start.format('HH:mm'),
            endTimeStr: end.format('HH:mm')
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

    return {
        events: dayEvents,
        data
    }
}
