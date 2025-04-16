'use client'

import { GroupDetail } from "@sola/sdk"
import { IframeSchedulePageDataType, IframeSchedulePageSearchParams } from "@/app/(iframe)/schedule/utils"
import { Dictionary } from "@/lang"
import { calculateGridPosition, IframeSchedulePageDataEventDetail } from "./data"
import ShareScheduleBtn from "@/components/client/ShareScheduleBtn"
import MonthlyPagination from "./MonthlyPagination"
import FilterBtn from "../../FilterBtn"
import ScheduleViewSwitcher from "../../ScheduleViewSwitcher"
import JoinedFilterBtn from "../../JoinedFilterBtn"
import { useMemo, useState } from "react"
import { getAuth, getInterval } from "@/utils"
import dayjs from "@/libs/dayjs"
import ListPagination from "./ListPagination"
import CompactViewEventItem from "./CompactViewEventItem"
import useModal from "@/components/client/Modal/useModal"
import { useToast } from "@/components/shadcn/Toast/use-toast"

interface ScheduleCompactViewProps {
    data: IframeSchedulePageDataType,
    groupDetail: GroupDetail,
    events: IframeSchedulePageDataEventDetail[],
    lang: Dictionary,
    authToken: string | null | undefined
}

export default function ScheduleCompactView({data: initialData, groupDetail, events: initialEvents, lang, authToken}: ScheduleCompactViewProps) {
    
    const [events, setEvents] = useState<IframeSchedulePageDataEventDetail[]>(initialEvents)
    const [data, setData] = useState<IframeSchedulePageDataType>(initialData)
    
    const interval = useMemo(() => {
        const {start, end} = getInterval(data.currDate, 'compact')
        const interval = []
        let current = dayjs.tz(start, groupDetail.timezone!)
        while (current.isSameOrBefore(dayjs.tz(end, groupDetail.timezone!))) {
            interval.push(current.endOf('day'))
            current = current.add(1, 'day')
        }
        return interval
    }, [data.currDate])

    const {closeModal, showLoading} = useModal()
    const {toast} = useToast()
   
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
    
    return <div className="min-h-[100svh] relative pb-12 bg-[#F8F9F8] w-full">
    <div className="schedule-bg"></div>
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
            view="compact"/>
        </div>

        <div className="desk-tool-bar flex-row justify-between hidden sm:flex">
            <div className="flex-row-item-center">
                <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{interval[0].format('YYYY MMMM')}</div>
                <div className="flex-row-item-center">
                    <MonthlyPagination
                        onChange={handleFilterChange}
                        timezone={data.group.timezone}
                        currStartDate={interval[0].format('YYYY-MM-DD')}/>
                </div>
            </div>
            <div className="flex-row-item-center mt-3 sm:mt-0">
                {!!authToken &&
                    <JoinedFilterBtn
                        onChange={handleFilterChange}
                        checked={data.filters.applied} 
                        label={lang['Joined']}/>
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
                <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{interval[0].format('YYYY MMMM')}</div>
            </div>
            <div className="ml-3">
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
                    }}/>
            </div>
            <div className="ml-3">
                <ShareScheduleBtn 
                lang={lang} 
                compact={true} 
                className="sm:hidden block"
                groupHandle={groupDetail.handle}
                view="compact"/>
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
            onChange={handleFilterChange}
            timezone={data.group.timezone}
            currStartDate={interval[0].format('YYYY-MM-DD')}/>

        {!!events.length &&
            <div>
                <div className="">
                    {
                        events.map((event, index) => {
                            return <CompactViewEventItem
                                lang={lang}
                                lastEvent={events[index - 1]}
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