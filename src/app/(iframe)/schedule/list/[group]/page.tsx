import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import FilterBtn from "@/app/(iframe)/schedule/FilterBtn"
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/data"
import JoinedFilterBtn from "@/app/(iframe)/schedule/JoinedFilterBtn"
import ListViewEventItem from "@/app/(iframe)/schedule/list/[group]/ListViewEventItem"
import ListPagination from "@/app/(iframe)/schedule/list/[group]/ListPagination"
import ScheduleViewSwitcher from "@/app/(iframe)/schedule/ScheduleViewSwitcher"

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

    const disPlayEvents = await calculateGridPosition({
        events: data.events,
        timezone: data.group.timezone,
        currentDate: data.interval[0].format('YYYY-MM-DD')
    })

    return <div className="min-h-[100svh] relative pb-12 bg-[#F8F9F8] w-full">
        <div className="schedule-bg"></div>
        <div className="page-width z-10 relative">
            <div className="py-3 sm:py-5 max-w-[100vw]">
                <div className="sm:text-2xl text-xl flex flex-row">
                    <a href={`/event/${data.group.handle}`} className="font-semibold text-[#6CD7B2] mr-2">
                        {data.group.nickname || data.group.handle}
                    </a>
                    <div>Event Schedule</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex-row-item-center">
                    <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{data.interval[0].format('YYYY MMMM')}</div>
                </div>
                <div className="flex-row-item-center mt-3 sm:mt-0">
                    {!!data.filters.profileId &&
                        <JoinedFilterBtn checked={data.filters.applied}/>
                    }

                    <FilterBtn filters={data.filters}
                        list={{
                            tags: data.tags,
                            venues: data.venues,
                            tracks: data.tracks
                        }}/>

                    <ScheduleViewSwitcher
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
                    <div className="flex-row-item-center mb-4 sm:text-xl">
                        <div className="text-[#7B7C7B] sm:w-[100px] flex-shrink-0 text-right">Time</div>
                        <div className="text-[#7B7C7B] flex-1 pl-7">Event</div>
                        <div className="text-[#7B7C7B] sm:w-[100px] flex-shrink-0">Venue</div>
                    </div>
                    <div className="">
                        {
                            disPlayEvents.map((event) => {
                                return <ListViewEventItem
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
