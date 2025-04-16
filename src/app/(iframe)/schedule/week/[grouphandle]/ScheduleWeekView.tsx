'use client'

import { GroupDetail } from "@sola/sdk"
import { IframeSchedulePageDataType, IframeSchedulePageSearchParams } from "../../utils"
import { Dictionary } from "@/lang"
import ShareScheduleBtn from "@/components/client/ShareScheduleBtn"
import WeeklyPagination from "./WeeklyPagination"
import JoinedFilterBtn from "../../JoinedFilterBtn"
import FilterBtn from "../../FilterBtn"
import ScheduleViewSwitcher from "../../ScheduleViewSwitcher"
import dayjs from "@/libs/dayjs"
import { getAuth, getInterval } from "@/utils"
import { useMemo, useState } from "react"
import { calculateGridPosition, IframeSchedulePageDataEventDetail } from "./data"
import WeeklyViewEventItem from "./WeeklyViewEventItem"
import useModal from "@/components/client/Modal/useModal"
import { useToast } from "@/components/shadcn/Toast/use-toast"

export interface ScheduleWeekViewProps {
    groupDetail: GroupDetail,
    data: IframeSchedulePageDataType,
    disPlayEvents: IframeSchedulePageDataEventDetail[],
    lang: Dictionary,
    authToken: string | null | undefined
}

export default function ScheduleWeekView({ groupDetail, data: initialData, lang, authToken, disPlayEvents }: ScheduleWeekViewProps) {

    const [events, setEvents] = useState<IframeSchedulePageDataEventDetail[]>(disPlayEvents)
    const [data, setData] = useState<IframeSchedulePageDataType>(initialData)

    const {closeModal, showLoading} = useModal()
    const {toast} = useToast()

    const interval = useMemo(() => {
        const {start, end} = getInterval(data.currDate, 'week')
        const interval = []
        let current = dayjs.tz(start, groupDetail.timezone!)
        while (current.isSameOrBefore(dayjs.tz(end, groupDetail.timezone!))) {
            interval.push(current.endOf('day'))
            current = current.add(1, 'day')
        }
        return interval
    }, [data.currDate])

   
    const handleFilterChange = async (searchParams: IframeSchedulePageSearchParams) => {
        showLoading()
        try {
            console.log('searchParams', searchParams)
            const {data, events} = await calculateGridPosition({
                searchParams,
                groupDetail,
                authToken: getAuth(),
                currPath: window.location.pathname
            })
            setData(data)
            setEvents(events)
            const newSearchParams = new URLSearchParams()
            Object.entries(searchParams).forEach(([key, value]) => {
                newSearchParams.set(key, value)
            })
            window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`)
        } catch (error) {
            console.error(error)
            toast({
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive'
            })
        } finally {
            closeModal()
        }
    }

    return <div className="min-h-[100svh] relative pb-12 bg-[#F8F9F8] !min-w-[1024px]">
        <div className="schedule-bg !min-w-[1024px]"></div>
        <div className="page-width z-10 relative">
            <div className="py-3 sm:py-5 max-w-[100vw] flex flex-row justify-between">
                <div className="sm:text-2xl text-xl">
                    <a href={data.eventHomeUrl} className="font-semibold text-[#6CD7B2] mr-2" target={data.isIframe ? "_blank" : "_self"}>
                        {data.group.nickname || data.group.handle}
                    </a>
                    <span className="whitespace-nowrap">{lang['Event Schedule']}</span>
                </div>
                <ShareScheduleBtn
                    lang={lang}
                    className="sm:block hidden"
                    groupHandle={groupDetail.handle}
                    view="week" />
            </div>

            <div className="desk-tool-bar sm:flex-row flex-col sm:justify-between flex">
                <div className="flex-row-item-center">
                    <div
                        className="schedule-month text-base sm:text-lg mr-2 font-semibold">{interval[0].format('YYYY MMMM')}</div>
                    <div className="flex-row-item-center">
                        <WeeklyPagination
                            onChange={handleFilterChange}
                            timezone={data.group.timezone}
                            currStartDate={interval[0].format('YYYY-MM-DD')} />
                    </div>
                </div>
                <div className="flex-row flex-nowrap items-center hidden sm:flex mt-0">
                    {!!authToken &&
                        <JoinedFilterBtn 
                            checked={data.filters.applied} 
                            label={lang['Joined']} 
                            onChange={handleFilterChange}
                        />
                    }

                    <FilterBtn
                        onChange={handleFilterChange}
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
                        }} />

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
                            onChange={handleFilterChange}
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
                            }} />
                    </div>

                    <div className="mr-3">
                        <ShareScheduleBtn
                            lang={lang}
                            compact={true}
                            className="sm:hidden block"
                            groupHandle={groupDetail.handle}
                            view="week" />
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
                    interval.map((day, index) => {
                        return <div className="h-[52px] leading-[52px] text-center" key={index}>
                            <span>{day.format('ddd')}</span>
                            <strong className="ml-1">{day.format('DD')}</strong>
                        </div>
                    })
                }
            </div>
            <div className="grid gap-2 grid-cols-7 w-[1000px]">
                {
                    events.map((event, index) => {
                        return <WeeklyViewEventItem
                            lang={lang}
                            event={event} key={index}
                            timezone={data.group.timezone || event.timezone} />
                    })
                }
            </div>
        </div>
    </div>
}