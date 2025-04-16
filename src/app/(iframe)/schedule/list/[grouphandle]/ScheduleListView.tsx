'use client'

import { useMemo, useState } from "react"
import { GroupDetail } from "@sola/sdk"
import {IframeSchedulePageSearchParams, IframeSchedulePageDataType } from "@/app/(iframe)/schedule/utils"
import { Dictionary } from "@/lang"
import ShareScheduleBtn from "@/components/client/ShareScheduleBtn"
import MonthPagination from "./MonthPagination"
import JoinedFilterBtn from "../../JoinedFilterBtn"
import FilterBtn from "../../FilterBtn"
import ScheduleViewSwitcher from "../../ScheduleViewSwitcher"
import ListPagination from "./ListPagination"
import ListViewEventItem from "./ListViewEventItem"
import { IframeSchedulePageDataEventDetail, ListViewData } from "./data"
import dayjs from '@/libs/dayjs'
import { getAuth, getInterval } from "@/utils"
import useModal from "@/components/client/Modal/useModal"
import { useToast } from "@/components/shadcn/Toast/use-toast"

export interface ScheduleListViewProps {
    groupDetail: GroupDetail,
    groupedEventByStartDate: Record<string, IframeSchedulePageDataEventDetail[]>,
    data: IframeSchedulePageDataType,
    lang: Dictionary,
    authToken: string | null | undefined
}

export default function ScheduleListView({groupDetail, groupedEventByStartDate, data: initialData, lang, authToken}: ScheduleListViewProps) {
    
    const [events, setEvents] = useState<Record<string, IframeSchedulePageDataEventDetail[]>>(groupedEventByStartDate)
    const [data, setData] = useState<IframeSchedulePageDataType>(initialData)

    const {closeModal, showLoading} = useModal()
    const {toast} = useToast()
    const interval = useMemo(() => {
        const {start, end} = getInterval(data.currDate, 'list')
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
            const {data, groupedEventByStartDate} = await ListViewData({
                searchParams,
                groupDetail,
                authToken: getAuth(),
                currPath: window.location.pathname
            })
            setData(data)
            setEvents(groupedEventByStartDate)
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
            <ShareScheduleBtn lang={lang} className="sm:block hidden" groupHandle={groupDetail.handle} view="list" />
        </div>

        <div className="desk-tool-bar hidden sm:flex flex-row justify-between">
            <div className="flex-row-item-center">
                <div className="schedule-month text-base sm:text-lg mr-2 font-semibold">{interval[0].format('YYYY MMMM')}</div>
                <div className="flex-row-item-center">
                    <MonthPagination
                        onChange={handleFilterChange}
                        timezone={data.group.timezone}
                        currStartDate={interval[1].format('YYYY-MM-DD')}/>
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
                    currView={'list'} />
            </div>
        </div>
        <div className="mobile-tool-bar flex flex-row sm:hidden">
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
                view="list"/>
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
            onChange={handleFilterChange}
            timezone={data.group.timezone}
            currStartDate={interval[0].format('YYYY-MM-DD')}/>

            <div>
            {Object.keys(events).map((startDate, index) => {
                            return <div key={index}>
                                <div className="font-semibold mb-1 mt-6">
                                    {startDate}
                                </div>
                                {
                                    events[startDate].map((event) => {
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
</div>
}