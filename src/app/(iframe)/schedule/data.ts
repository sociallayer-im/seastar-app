'use server'
// Day-view flavour of the schedule data: wraps the shared soon-backed loader
// in ./utils and adds the day grid extras (interval, startDate, group_id).
import dayjs, {DayjsType} from "@/libs/dayjs"
import {getInterval, pickSearchParam} from "@/utils"
import {headers} from "next/headers"
import {getServerSideAuth} from '@/app/actions'
import {GroupDetail} from '@sola/sdk'
import {
    IframeSchedulePageData as sharedScheduleData,
    IframeSchedulePageSearchParams,
    IframeSchedulePageParams,
    IframeSchedulePageDataType,
    IframeSchedulePageDataEvent as SharedScheduleEvent,
    Filter,
} from './utils'

export type {IframeSchedulePageSearchParams, IframeSchedulePageParams, Filter}

export interface IframeSchedulePageDataEvent extends SharedScheduleEvent {
    group_id: string
}

export interface IframeSchedulePageData extends Omit<IframeSchedulePageDataType, 'events'> {
    interval: DayjsType[]
    startDate?: string
    events: IframeSchedulePageDataEvent[]
}

export interface IframeSchedulePageDataProps {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams,
    groupDetail: GroupDetail,
    view: 'week' | 'day' | 'list' | 'compact',
}

export async function IframeSchedulePageData({
                                                 searchParams,
                                                 groupDetail,
                                                 view,
                                             }: IframeSchedulePageDataProps): Promise<IframeSchedulePageData> {
    const authToken = await getServerSideAuth()
    const headersList = await headers()
    const currPath = headersList.get('x-current-path')

    const base = await sharedScheduleData({searchParams, groupDetail, view, authToken, currPath})

    const startDate = pickSearchParam(searchParams.start_date)
    const {start, end} = getInterval(startDate, view, groupDetail.timezone || undefined)
    const interval: DayjsType[] = []
    let current = dayjs.tz(start, groupDetail.timezone || 'UTC')
    while (current.isSameOrBefore(dayjs.tz(end, groupDetail.timezone || 'UTC'))) {
        interval.push(current.endOf('day'))
        current = current.add(1, 'day')
    }

    return {
        ...base,
        interval,
        startDate,
        events: base.events.map(e => ({...e, group_id: e.group.id}))
    }
}
