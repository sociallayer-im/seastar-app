import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import WeeklyViewEventItem from "@/app/(iframe)/schedule/week/[grouphandle]/WeeklyViewEventItem"
import WeeklyPagination from "@/app/(iframe)/schedule/week/[grouphandle]/WeeklyPagination"
import FilterBtn from "@/app/(iframe)/schedule/FilterBtn"
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/data"
import JoinedFilterBtn from "@/app/(iframe)/schedule/JoinedFilterBtn"
import ScheduleViewSwitcher from "@/app/(iframe)/schedule/ScheduleViewSwitcher"
import {getServerSideAuth, selectLang} from "@/app/actions"
import {cache} from 'react'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

const cachedGetGroupDetailByHandle = cache((handle: string) => {
    return getGroupDetailByHandle({params: {groupHandle: handle}, clientMode: CLIENT_MODE})
})

export async function generateMetadata({params}: {params: IframeSchedulePageParams, searchParams: IframeSchedulePageSearchParams}) {
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {
        redirect('/404')
    } else {
        return {
            title: `${groupDetail.nickname || groupDetail.handle} Event Schedule | Social Layer`
        }
    }
}

export default async function IframeScheduleWeeklyPage({searchParams, params}: {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {redirect('/404')}
    const data = await IframeSchedulePageData({params, searchParams, groupDetail, view: 'week'})
    if (!data.group) {
        redirect('/error')
    }

    const disPlayEvents = await calculateGridPosition({
        events: data.events,
        interval: data.interval,
        timezone: data.group.timezone
    })

    const lang = (await selectLang()).lang

    const authToken = await getServerSideAuth()

    return <div className="min-h-[100svh] relative pb-12 bg-[#F8F9F8] !min-w-[1024px]">
        <div className="schedule-bg !min-w-[1024px]"></div>
        <div className="page-width z-10 relative">
            <div className="py-3 sm:py-5 max-w-[100vw]">
                <div className="sm:text-2xl text-xl flex flex-row">
                    <a href={data.eventHomeUrl} className="font-semibold text-[#6CD7B2] mr-2">
                        {data.group.nickname || data.group.handle}
                    </a>
                    <div>{lang['Event Schedule']}</div>
                </div>
            </div>

            <div className="desk-tool-bar sm:flex-row flex-col sm:justify-between flex">
                <div className="flex-row-item-center">
                    <div
                        className="schedule-month text-base sm:text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                    <div className="flex-row-item-center">
                        <WeeklyPagination
                            timezone={data.group.timezone}
                            currStartDate={data.interval[0].format('YYYY-MM-DD')}/>
                    </div>
                </div>
                <div className="flex-row flex-nowrap items-center hidden sm:flex mt-0">
                    {!!authToken &&
                        <JoinedFilterBtn checked={data.filters.applied} label={lang['Joined']}/>
                    }

                    <FilterBtn
                        isFiltered={data.isFiltered}
                        filters={data.filters}
                        labels={{
                            filter: lang['Filter'],
                            filterDialog: {
                                filters: lang['Filters'],
                                tags: lang['Tags'],
                                venues: lang['Venues'],
                                tracks: lang['Tracks'],
                                joined: lang['Joined'],
                                recurring: lang['Repeating Events'],
                                multiDay: lang['Multi-day Events'],
                                cancel: lang['Cancel'],
                                showEvents: lang['Show Events']
                            }
                        }}
                        list={{
                            tags: data.tags,
                            venues: data.venues,
                            tracks: data.tracks
                        }}/>

                    <ScheduleViewSwitcher
                        compactUrl={data.compactUrl}
                        weeklyUrl={data.weeklyUrl}
                        dailyUrl={data.dailyUrl}
                        listingUrl={data.listingUrl}
                        currView={'week'} />
                </div>

                <div className="flex-row flex-nowrap items-center flex sm:hidden mt-3">
                   <div className="mr-3">
                       <FilterBtn
                           compact={true}
                           isFiltered={data.isFiltered}
                           filters={data.filters}
                           labels={{
                               filter: lang['Filter'],
                               filterDialog: {
                                   filters: lang['Filters'],
                                   tags: lang['Tags'],
                                   venues: lang['Venues'],
                                   tracks: lang['Tracks'],
                                   joined: lang['Joined'],
                                   recurring: lang['Repeating Events'],
                                   multiDay: lang['Multi-day Events'],
                                   cancel: lang['Cancel'],
                                   showEvents: lang['Show Events']
                               }
                           }}
                           list={{
                               tags: data.tags,
                               venues: data.venues,
                               tracks: data.tracks
                           }}/>
                   </div>

                    <div className="mr-3">
                        <ScheduleViewSwitcher
                            dropdown={true}
                            compactUrl={data.compactUrl}
                            weeklyUrl={data.weeklyUrl}
                            dailyUrl={data.dailyUrl}
                            listingUrl={data.listingUrl}
                            currView={'week'} />
                    </div>
                </div>
            </div>
            <div className="grid gap-2 sticky top-0 z-[999] grid-cols-7 bg-[#F8F9F8] w-[1000px]">
                {
                    data.interval.map((day, index) => {
                        return <div className="h-[52px] leading-[52px] text-center" key={index}>
                            <span>{day.format('ddd')}</span>
                            <strong className="ml-1">{day.format('DD')}</strong>
                        </div>
                    })
                }
            </div>
            <div className="grid gap-2 grid-cols-7 w-[1000px]">
                {
                    disPlayEvents.map((event, index) => {
                        return <WeeklyViewEventItem
                            lang={lang}
                            event={event} key={index}
                            timezone={data.group.timezone || event.timezone}/>
                    })
                }
            </div>
        </div>
    </div>
}
