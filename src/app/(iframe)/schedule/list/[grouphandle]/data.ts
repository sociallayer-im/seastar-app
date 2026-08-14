import {IframeSchedulePageDataEvent, IframeSchedulePageSearchParams} from "@/app/(iframe)/schedule/utils"
import Dayjs from '@/libs/dayjs'
import { IframeSchedulePageData } from "../../utils"
import { GroupDetail } from "@sola/sdk"


export interface IframeSchedulePageDataEventDetail extends IframeSchedulePageDataEvent {
    date: string
}

interface ListViewDataProps {
    searchParams: IframeSchedulePageSearchParams,
    groupDetail: GroupDetail,
    currPath: string,
    authToken: string | null | undefined
    /** Pass false only from a browser-side call — see compact's data.ts. */
    noCache?: boolean
}

export async function ListViewData({
    searchParams,
    groupDetail,
    currPath,
    authToken,
    noCache
}: ListViewDataProps) {

    const data = await IframeSchedulePageData({searchParams, groupDetail, authToken, currPath, view: 'list', noCache})
    const timezone = groupDetail.timezone || 'UTC'
    
    const dayEvents = [] as IframeSchedulePageDataEventDetail[]
    data.events.forEach(event => {
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

    return {
        data,
        groupedEventByStartDate
    }
}
