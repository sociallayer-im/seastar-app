import {calculateGridPosition, IframeSchedulePageWeeklyData} from "./data"
import {redirect} from 'next/navigation'
import {pickSearchParam} from "@/utils"
import WeeklyViewEventItem from "@/app/(iframe)/iframe/schedule/week/[group]/WeeklyViewEventItem"
import WeeklyPagination from "@/app/(iframe)/iframe/schedule/week/[group]/WeeklyPagination"

interface IframeSchedulePageSearchParams {
    start_date: string | string[] | undefined
}

interface IframeSchedulePageSearchParams {
    group: string
}

export async function generateMetadata({params, searchParams}: {params: IframeSchedulePageSearchParams, searchParams: IframeSchedulePageSearchParams}) {
    const groupName = params.group
    const startDate = pickSearchParam(searchParams.start_date)
    const data = await IframeSchedulePageWeeklyData({groupName, startDate})

    if (!data.group) {
        redirect('/error')
    } else {
        return {
            title: `${data.group.nickname || data.group.handle} Event Schedule | Social Layer`
        }
    }
}

export default async function IframeScheduleWeeklyPage({searchParams, params}: {
    params: IframeSchedulePageSearchParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const groupName = params.group
    const startDate = pickSearchParam(searchParams.start_date)
    const data = await IframeSchedulePageWeeklyData({groupName, startDate})

    if (!data.group) {
        redirect('/error')
    }

    const disPlayEvents = await calculateGridPosition({
        events: data.events,
        interval: data.interval,
        timezone: data.group.timezone
    })

    return <div className="min-h-[calc(100svh-48px)] relative pb-12 bg-[#F8F9F8]">
        <div className="schedule-bg"></div>
        <div className="page-width z-10 relative">
            <div className="py-5">
                <div className="text-2xl my-2">
                    <a href={`/event/${data.group.handle}`} className="font-semibold text-[#6CD7B2]">
                        {data.group.nickname || data.group.handle}
                    </a> Event Schedule
                </div>
            </div>

            <div className="flex-row-item-center justify-between">
                <div className="flex-row-item-center">
                    <div
                        className="schedule-month text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                    <div className="flex-row-item-center">
                        <WeeklyPagination
                            timezone={data.group.timezone}
                            currStartDate={data.interval[0].format('YYYY-MM-DD')}/>
                    </div>
                </div>
                <div className="flex-row-item-center">
                    <div className="ml-2 dropdown">
                        <div tabIndex={1} role="button"
                            className="flex-row-item-center btn btn-outline btn-sm w-full justify-between">
                            <div>Week</div>
                            <i className="uil-angle-down hidden sm:block"></i>
                        </div>
                        <ul tabIndex={2}
                            className="min-w-full dropdown-content menu bg-white rounded-box z-[9999] p-2 shadow">
                            <li>
                                <a href={`/iframe/schedule/week/${data.group.handle}${startDate ? `?start_date=${startDate}` : ''}`}>Week</a>
                            </li>
                            <li>
                                <a href={`/iframe/schedule/day/${data.group.handle}${startDate ? `?start_date=${startDate}` : ''}`}>Day</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="grid gap-2 sticky top-0 z-[999] grid-cols-7 bg-[#F8F9F8] min-w-[1000px]">
                {
                    data.interval.map((day, index) => {
                        return <div className="h-[52px] leading-[52px] text-center" key={index}>
                            <span>{day.format('ddd')}</span>
                            <strong className="ml-1">{day.format('DD')}</strong>
                        </div>
                    })
                }
            </div>
            <div className="grid gap-2 grid-cols-7 min-w-[1000px]">
                {
                    disPlayEvents.map((event, index) => {
                        return <WeeklyViewEventItem event={event} key={index} timezone={data.group.timezone}/>
                    })
                }
            </div>
        </div>
    </div>
}
