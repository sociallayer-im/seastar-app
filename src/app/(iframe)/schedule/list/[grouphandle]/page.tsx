import {ListViewData} from "./data"
import {redirect} from 'next/navigation'
import FilterBtn from "@/app/(iframe)/schedule/FilterBtn"
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/data"
import JoinedFilterBtn from "@/app/(iframe)/schedule/JoinedFilterBtn"
import ListViewEventItem from "@/app/(iframe)/schedule/list/[grouphandle]/ListViewEventItem"
import ListPagination from "@/app/(iframe)/schedule/list/[grouphandle]/ListPagination"
import ScheduleViewSwitcher from "@/app/(iframe)/schedule/ScheduleViewSwitcher"
import {getServerSideAuth, selectLang} from "@/app/actions"
import Dayjs from '@/libs/dayjs'

export async function generateMetadata({params, searchParams}: {params: IframeSchedulePageParams, searchParams: IframeSchedulePageSearchParams}) {
    const data = await IframeSchedulePageData({params, searchParams, view: 'list'})
    if (!data.group) {
        redirect('/error')
    } else {
        return {
            title: `${data.group.nickname || data.group.handle} Event Schedule | Social Layer`
        }
    }
}

export default async function IframeScheduleWeeklyPage({searchParams, params}: {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const data = await IframeSchedulePageData({params, searchParams, view: 'list'})
    if (!data.group) {
        redirect('/error')
    }

    const {allDayEvents, groupedEventByStartTime} = await ListViewData({
        events: data.events,
        timezone: data.group.timezone,
        currentDate: data.interval[0].format('YYYY-MM-DD')
    })

    const lang = (await selectLang()).lang

    const authToken = await getServerSideAuth()

    return <div className="min-h-[100svh] relative pb-12 bg-[#F8F9F8] w-full">
        <div className="schedule-bg"></div>
        <div className="page-width z-10 relative">
            <div className="py-3 sm:py-5 max-w-[100vw]">
                <div className="sm:text-2xl text-xl flex flex-row">
                    <a href={data.eventHomeUrl} className="font-semibold text-[#6CD7B2] mr-2">
                        {data.group.nickname || data.group.handle}
                    </a>
                    <div>{lang['Event Schedule']}</div>
                </div>
            </div>

            <div className="desk-tool-bar hidden sm:flex flex-row justify-between">
                <div className="flex-row-item-center">
                    <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                </div>
                <div className="flex-row-item-center mt-3 sm:mt-0">
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
                        currView={'list'} />
                </div>
            </div>
            <div className="mobile-tool-bar flex flex-row sm:hidden">
                <div className="flex-row-item-center">
                    <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                </div>

                <div className="ml-3">
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

                <div className="ml-3">
                    <ScheduleViewSwitcher
                        dropdown={true}
                        compactUrl={data.compactUrl}
                        weeklyUrl={data.weeklyUrl}
                        dailyUrl={data.dailyUrl}
                        listingUrl={data.listingUrl}
                        currView={'list'} />
                </div>
            </div>
            <ListPagination
                timezone={data.group.timezone}
                currStartDate={data.interval[0].format('YYYY-MM-DD')}/>

            {!!data.events.length &&
                <div>
                    <div className="">
                        {!!allDayEvents.length &&
                            <div>
                                <div className="sm:pl-7 font-semibold mb-3">All Day</div>
                                {
                                    allDayEvents.map((event) => {
                                        return <ListViewEventItem
                                            lang={lang}
                                            key={event.id}
                                            event={event}
                                            timezone={data.group.timezone} />
                                    })
                                }
                            </div>
                        }
                        {
                            Object.keys(groupedEventByStartTime).map((startTime, index) => {
                                return <div key={index}>
                                    <div className="sm:pl-7 font-semibold mb-1 mt-6">
                                        {Dayjs.tz(new Date(startTime).getTime(), data.group.timezone).format('HH:mm, MMM DD')}
                                    </div>
                                    {
                                        groupedEventByStartTime[startTime].map((event) => {
                                            return <ListViewEventItem
                                                lang={lang}
                                                key={event.id}
                                                event={event}
                                                timezone={data.group.timezone} />
                                        })
                                    }
                                </div>
                            })
                        }
                    </div>
                </div>
            }
        </div>
    </div>
}
