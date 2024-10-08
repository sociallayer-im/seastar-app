import {calculateGridPosition, iframeSchedulePageDailyData} from "./data"
import {redirect} from 'next/navigation'
import {pickSearchParam} from "@/utils"
import {getHourLabel} from "@/app/(iframe)/iframe/schedule/day/[group]/data"
import DailyViewEventItem from "@/app/(iframe)/iframe/schedule/day/[group]/DailyViewEventItem"
import DailyPagination from "@/app/(iframe)/iframe/schedule/day/[group]/DailyPagination"
import ScrollFirstEventIntoView from "@/app/(iframe)/iframe/schedule/day/[group]/ScrollFirstEventIntoView"

interface IframeSchedulePageSearchParams {
    start_date: string | string[] | undefined
}

interface IframeSchedulePageSearchParams {
    group: string
}

export async function generateMetadata({params, searchParams}: {
    params: IframeSchedulePageSearchParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const groupName = params.group
    const startDate = pickSearchParam(searchParams.start_date)
    const data = await iframeSchedulePageDailyData({groupName, startDate})

    if (!data.group) {
        redirect('/error')
    } else {
        return {
            title: `${data.group.nickname || data.group.handle} Event Schedule | Social Layer`
        }
    }
}

export default async function IframeScheduleDailyPage({searchParams, params}: {
    params: IframeSchedulePageSearchParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const groupName = params.group
    const startDate = pickSearchParam(searchParams.start_date)
    const data = await iframeSchedulePageDailyData({groupName, startDate})
    const hourLabels = await getHourLabel()

    if (!data.group) {
        redirect('/error')
    }

    const displayEvents = await calculateGridPosition({
        events: data.events,
        timezone: data.group.timezone,
        currDate: data.interval[0].format('YYYY-MM-DD')
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
                </div>
                <div className="flex-row-item-center">
                    <div className="ml-2 dropdown">
                        <div tabIndex={1} role="button"
                            className="flex-row-item-center btn btn-outline btn-sm w-full justify-between">
                            <div>Day</div>
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

            <div>
                <div
                    className="h-[52px] sticky top-0 z-[999] bg-[#F8F9F8] flex flex-row flex-nowrap items-center justify-center text-lg text-center">
                    <DailyPagination
                        timezone={data.group.timezone}
                        currStartDate={data.interval[0].format('YYYY-MM-DD')}
                    />
                </div>

                <div className="py-8 flex flex-row">
                    <div className="flex flex-col w-22">
                        {
                            hourLabels.map((label) => {
                                return <div key={label}
                                    className="h-[100px] px-3 text-right text-xs text-[#71717A] translate-y-[-0.5rem]">
                                    {label}
                                </div>
                            })
                        }
                    </div>
                    <div className="canvas relative flex-1">
                        <div className="grid-rows flex w-full bg-[--background] flex-col flex-nowrap relative">
                            {
                                hourLabels.map((label) => {
                                    return <div
                                        key={label}
                                        className="h-[100px] border borter-t-[#E0E0E0] relative after:content-[''] after:block after:h-[1px] after:border after:border-b-[#eee] after:absolute after:w-full after:left-0 after:top-[50px] after:border-dashed"/>

                                })
                            }
                        </div>
                        <div className="grid-cols absolute left-0 top-0 w-full h-full flex">
                            <div className="flex-1 border border-r-[#E0E0E0]" />
                            <div className="flex-1 border border-r-[#E0E0E0]" />
                            <div className="flex-1 border border-r-[#E0E0E0]" />
                            <div className="flex-1 border border-r-[#E0E0E0]" />
                            <div className="flex-1 border border-r-[#E0E0E0]" />
                            <div className="flex-1 border border-r-[#E0E0E0]" />
                        </div>
                        <div className="grid-events absolute left-0 top-0 w-full h-full">
                            {
                                displayEvents.map((event, index) => {
                                    return <DailyViewEventItem
                                        key={index}
                                        event={event}
                                        timezone={data.group.timezone} />
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>

            <ScrollFirstEventIntoView />
        </div>
    </div>
}
