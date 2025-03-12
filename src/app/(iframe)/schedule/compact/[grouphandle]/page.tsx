import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import FilterBtn from "@/app/(iframe)/schedule/FilterBtn"
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/data"
import JoinedFilterBtn from "@/app/(iframe)/schedule/JoinedFilterBtn"
import CompactViewEventItem from "./CompactViewEventItem"
import ListPagination from "@/app/(iframe)/schedule/list/[grouphandle]/ListPagination"
import ScheduleViewSwitcher from "@/app/(iframe)/schedule/ScheduleViewSwitcher"
import {getCurrProfile, getServerSideAuth, selectLang} from "@/app/actions"
import MonthlyPagination from "./MonthlyPagination"

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
    const data = await IframeSchedulePageData({params, searchParams, view: 'compact'})
    if (!data.group) {
        redirect('/error')
    }

    const disPlayEvents = await calculateGridPosition({
        events: data.events,
        timezone: data.group.timezone,
        currentDate: data.interval[0].format('YYYY-MM-DD')
    })

    const authToken = await getServerSideAuth()

    const lang = (await selectLang()).lang

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

            <div className="desk-tool-bar flex-row justify-between hidden sm:flex">
                <div className="flex-row-item-center">
                    <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                    <div className="flex-row-item-center">
                        <MonthlyPagination
                            timezone={data.group.timezone}
                            currStartDate={data.interval[0].format('YYYY-MM-DD')}/>
                    </div>
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
                        currView={'compact'} />
                </div>
            </div>
            <div className="mobile-tool-bar flex-row flex sm:hidden">
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
                        currView={'compact'} />
                </div>
            </div>
            <ListPagination
                timezone={data.group.timezone}
                currStartDate={data.interval[0].format('YYYY-MM-DD')}/>

            {!!data.events.length &&
                <div>
                    <div className="">
                        {
                            disPlayEvents.map((event, index) => {
                                return <CompactViewEventItem
                                    lang={lang}
                                    lastEvent={disPlayEvents[index - 1]}
                                    key={event.id}
                                    event={event}
                                    timezone={data.group.timezone} />
                            })
                        }
                    </div>
                </div>
            }
        </div>
    </div>
}
