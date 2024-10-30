import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import {getHourLabel} from "@/app/(iframe)/schedule/day/[group]/data"
import DailyViewEventItem from "@/app/(iframe)/schedule/day/[group]/DailyViewEventItem"
import DailyPagination from "@/app/(iframe)/schedule/day/[group]/DailyPagination"
import ScrollFirstEventIntoView from "@/app/(iframe)/schedule/day/[group]/ScrollFirstEventIntoView"
import FilterBtn from "@/app/(iframe)/schedule/FilterBtn"
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/data"
import JoinedFilterBtn from "@/app/(iframe)/schedule/JoinedFilterBtn"
import ScheduleViewSwitcher from "@/app/(iframe)/schedule/ScheduleViewSwitcher"
import DailyViewAllDayEventItem from "@/app/(iframe)/schedule/day/[group]/DailyViewAllDayEventItem"

export async function generateMetadata({params, searchParams}: {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const data = await IframeSchedulePageData({
        params,
        searchParams,
        view: 'day'
    })

    if (!data.group) {
        redirect('/error')
    } else {
        return {
            title: `${data.group.nickname || data.group.handle} Event Schedule | Social Layer`
        }
    }
}

export default async function IframeScheduleDailyPage({searchParams, params}: {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const data = await IframeSchedulePageData({
        params,
        searchParams,
        view: 'day'
    })

    const hourLabels = await getHourLabel()

    if (!data.group) {
        redirect('/error')
    }

    const {events: displayEvents, allDayEvents} = await calculateGridPosition({
        events: data.events,
        timezone: data.group.timezone,
        currDate: data.interval[0].format('YYYY-MM-DD')
    })


    return <div className="min-h-[calc(100svh-48px)] relative pb-12 bg-[#F8F9F8]">
        <div className="schedule-bg"></div>
        <div className="page-width z-10 relative">
            <div className="py-3 sm:py-5">
                <div className="sm:text-2xl text-xl flex flex-row">
                    <a href={`/event/${data.group.handle}`} className="font-semibold text-[#6CD7B2] mr-2">
                        {data.group.nickname || data.group.handle}
                    </a>
                    <div>Event Schedule</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex-row-item-center">
                    <div
                        className="schedule-month text-base sm:text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                </div>
                <div className="flex-row-item-center mt-3 sm:mt-0">
                    {!!data.filters.profileId &&
                        <JoinedFilterBtn checked={data.filters.applied}/>
                    }

                    <FilterBtn
                        isFiltered={data.isFiltered}
                        filters={data.filters}
                        list={{
                            tags: data.tags,
                            venues: data.venues,
                            tracks: data.tracks
                        }} />

                    <ScheduleViewSwitcher
                        weeklyUrl={data.weeklyUrl}
                        dailyUrl={data.dailyUrl}
                        listingUrl={data.listingUrl}
                        currView={'day'} />
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
                <div className="py-1 flex flex-row">
                    <div className="flex flex-col w-22">
                        <div className="px-3 text-right text-xs text-[#71717A]">
                            All Day
                        </div>
                    </div>
                    <div className="flex-1 flex-col">
                        { allDayEvents.map((event, index) => {
                            return <DailyViewAllDayEventItem
                                timezone={data.group.timezone}
                                event={event} key={index}/>
                        })
                        }
                    </div>
                </div>

                <div className="py-1 flex flex-row">
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
                        <div className="grid-rows flex w-full flex-col flex-nowrap relative">
                            {
                                hourLabels.map((label) => {
                                    return <div
                                        key={label}
                                        className="h-[100px] border borter-t-[#E0E0E0] relative after:content-[''] after:block after:h-[1px] after:border after:border-b-[#eee] after:absolute after:w-full after:left-0 after:top-[50px] after:border-dashed"/>

                                })
                            }
                        </div>
                        <div className="grid-cols absolute left-0 top-0 w-full h-full flex">
                            <div className="flex-1 border border-r-[#E0E0E0]"/>
                            <div className="flex-1 border border-r-[#E0E0E0]"/>
                            <div className="flex-1 border border-r-[#E0E0E0]"/>
                            <div className="flex-1 border border-r-[#E0E0E0]"/>
                            <div className="flex-1 border border-r-[#E0E0E0]"/>
                            <div className="flex-1 border border-r-[#E0E0E0]"/>
                        </div>
                        <div className="grid-events absolute left-0 top-0 w-full h-full">
                            {
                                displayEvents.map((event, index) => {
                                    return <DailyViewEventItem
                                        key={index}
                                        event={event}
                                        timezone={data.group.timezone}/>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>

            <ScrollFirstEventIntoView/>
        </div>
    </div>
}
