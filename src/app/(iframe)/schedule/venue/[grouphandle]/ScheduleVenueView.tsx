'use client'

import { GroupDetail, search, VenueDetail } from "@sola/sdk"
import { IframeSchedulePageDataType } from "@/app/(iframe)/schedule/utils"
import { Dictionary } from "@/lang"
import { IframeSchedulePageDataEventDetail, calculateGridPosition } from "./data"
import dayjs from "@/libs/dayjs"
import { Fragment, useEffect, useMemo, useState } from "react"
import VenueViewEventItem from "./VenueViewEventItem"
import DatePicker from "@/components/client/DatePicker"
import { Input } from "@/components/shadcn/Input"
import { getAuth } from "@/utils"
import { toast } from "@/components/shadcn/Toast/use-toast"
import useModal from "@/components/client/Modal/useModal"

interface ScheduleVenueViewProps {
    data: IframeSchedulePageDataType,
    groupDetail: GroupDetail,
    events: IframeSchedulePageDataEventDetail[],
    lang: Dictionary,
    authToken: string | null | undefined
}

export default function ScheduleVenueView({ data: initialData, groupDetail, events: initialEvents, lang, authToken }: ScheduleVenueViewProps) {
    const [data, setData] = useState<IframeSchedulePageDataType>(initialData)
    const [events, setEvents] = useState<IframeSchedulePageDataEventDetail[]>(initialEvents)
    const { showLoading, closeModal } = useModal()

    // 生成时间标签，每15分钟一个
    const timeLabels = [] as string[]
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            timeLabels.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
        }
    }

    // 获取所有唯一的场馆
    const venues = useMemo(() => {
        const groupVenues = groupDetail.venues || []
        const minVenueLengt = 20
        if (groupVenues.length < minVenueLengt) {
            const PlaceholderVenue = {
                id: 0,
                title: '',
                image_urls: [],
            } as unknown as VenueDetail
            return groupVenues.concat(PlaceholderVenue).concat(Array(minVenueLengt - groupVenues.length).fill(PlaceholderVenue))
        } else {
            return groupVenues
        }
    }, [groupDetail.venues])

    const venueWidth = 150
    const venueHeight = 110
    const timeHeight = 34
    const timeWidth = 80
    const pageWidth = venues.length * venueWidth + timeWidth + 'px'
    const timeStep = 15

    const [now, setNow] = useState<dayjs.Dayjs>(dayjs.tz(new Date(), groupDetail.timezone!))
    const totalMinutes = now.diff(now.startOf('day'), 'minute')
    const showCursor = useMemo(() => {
        return now.isSame(dayjs.tz(data.currDate, groupDetail.timezone!), 'date')
    }, [now, data.currDate, groupDetail.timezone])

    useEffect(() => {
        // scroll cursor to view
        const cursor = document.getElementById('curr-time-cursor')
        if (cursor) {
            cursor.scrollIntoView({ behavior: 'smooth', block: 'center' })


            const interval = setInterval(() => {
                setNow(dayjs.tz(new Date(), groupDetail.timezone!))
            }, 1000 * 60)
            return () => clearInterval(interval)
        }
    }, [])

    const handleDateChange = async (date: string) => {
        const loading = showLoading()
        try {
            const searchParams = {
                start_date: date
            }
            console.log('searchParams', searchParams)
            const { data, events } = await calculateGridPosition({
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
            closeModal(loading)
        }
    }


    return (
        <div className="w-full overflow-auto flex flex-col h-[100svh]">
            <div className="py-2 sm:py-5 w-full flex flex-row items-center px-4 schedule-gradient">
                <div>
                    <a href={data.eventHomeUrl} className="font-semibold text-[#6CD7B2] mr-2" target={data.isIframe ? "_blank" : "_self"}>
                        {data.group.nickname || data.group.handle}
                    </a>
                    <span className="whitespace-nowrap">{lang['Event Schedule']}</span>
                </div>

                <DatePicker initDate={data.currDate} onChange={handleDateChange}>
                    <Input type="text"
                        inputSize="sm"
                        placeholder={'Set Date'}
                        className="ml-2 !text-base !w-auto"
                        readOnly
                        value={data.currDate}
                        endAdornment={<i className="uil-calender text-base" />}
                    />
                </DatePicker>
            </div>
          <div className="max-w-full overflow-auto flex-1" >
          <div className="min-w-full" style={{ width: pageWidth }}>
                <div className="grid sticky top-0 z-20" style={{
                    gridTemplateColumns: `${timeWidth}px repeat(${venues.length}, ${venueWidth}px)`,
                    gridTemplateRows: `${venueHeight}px`,
                }}>
                    <div className="border-r border-b border-t border-gray-200 bg-gray-50 sticky left-0 top-0 z-30" />

                    {venues.map((venue, index) => (
                        <div key={index}
                            className="overflow-hidden text-sm border-r border-b border-t  border-gray-200 bg-gray-50 text-center font-medium relative">
                            {venue.image_urls?.[0] && venue.id !== 0 && <img src={venue.image_urls?.[0]} alt="" className="w-full h-full object-cover" />}
                            {!venue.image_urls?.[0] && venue.id !== 0 && <img src={'/images/venue_default_bg.jpg'} alt="" className="w-full h-full object-cover opacity-50" />}
                            <div className="font-semibold p-3 absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-end bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.8)]  to-[rgba(255,255,255,1)] ">
                                {venue.title}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid relative" style={{
                    gridTemplateColumns: `${timeWidth}px repeat(${venues.length}, ${venueWidth}px)`,
                    gridTemplateRows: `repeat(${timeLabels.length}, ${timeHeight}px)`,
                }}>

                    {timeLabels.map((time, timeIndex) => (
                        <Fragment key={`time-${time}`}>
                            <div key={`time-${time}`}
                                style={{
                                    gridRow: timeIndex + 1,
                                    gridColumn: 1,
                                }}
                                className="sticky left-0 z-10 border-r border-b-dashed border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center justify-center">
                                {time !== '00:00' && <span className="text-xs -translate-y-[18px]">{time}</span>}
                            </div>

                            {venues.map((venue, venueIndex) => {
                                return (
                                    <div
                                        key={`empty-${venueIndex}`}
                                        className="border-r border-b border-gray-200"
                                        style={{
                                            gridRow: timeIndex + 1,
                                            gridColumn: venueIndex + 2,
                                        }}
                                    />
                                )
                            })}
                        </Fragment>
                    ))}

                    {
                        events.map((event, eventIndex) => {
                            if (!event.venue) {
                                return null
                            }

                            const startTime = dayjs.tz(new Date(event.start_time), groupDetail.timezone || 'UTC')
                            const endTime = dayjs.tz(new Date(event.end_time), groupDetail.timezone || 'UTC')
                            const duration = endTime.diff(startTime, 'minutes')
                            const venueIndex = venues.findIndex(v => v.id === event.venue?.id)

                            const x = venueIndex + 1
                            const y = (startTime.hour() * 60 + startTime.minute()) / timeStep * timeHeight
                            const height = duration / timeStep * timeHeight

                            return <VenueViewEventItem
                                key={`event-${eventIndex}`}
                                width={venueWidth}
                                lang={lang}
                                event={event}
                                height={`${height}px`}
                                top={`${y}px`}
                                left={`${x * venueWidth - (venueWidth - timeWidth)}px`}
                            />
                        })
                    }

                    {
                        showCursor && (
                            <div id="curr-time-cursor" className='w-full absolute border-t border-red-500 text-white'
                                style={{
                                    zIndex: 10,
                                    top: `${totalMinutes / timeStep * timeHeight}px`,
                                    left: 0,
                                    height: '1px',
                                }}>

                                <span className="text-xs bg-red-500  px-3 rounded-full translate-y-[-82%] inline-flex translate-x-1 font-semibold">
                                    {now.format('HH:mm')}
                                </span>
                            </div>
                        )
                    }
                </div>
            </div>
          </div>
        </div>
    )
}