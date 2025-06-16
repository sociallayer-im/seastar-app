'use client'

import { GroupDetail } from "@sola/sdk"
import { IframeSchedulePageDataType } from "@/app/(iframe)/schedule/utils"
import { Dictionary } from "@/lang"
import { IframeSchedulePageDataEventDetail } from "./data"
import dayjs from "@/libs/dayjs"
import { useEffect, useState } from "react"
import VenueViewEventItem from "./VenueViewEventItem"

interface ScheduleVenueViewProps {
    data: IframeSchedulePageDataType,
    groupDetail: GroupDetail,
    events: IframeSchedulePageDataEventDetail[],
    lang: Dictionary,
    authToken: string | null | undefined
}

export default function ScheduleCompactView({data: initialData, groupDetail, events: initialEvents, lang, authToken}: ScheduleVenueViewProps) {
    const [data, setData] = useState<IframeSchedulePageDataType>(initialData)
    const [events, setEvents] = useState<IframeSchedulePageDataEventDetail[]>(initialEvents)
    
    // 生成时间标签，每15分钟一个
    const timeLabels = [] as string[]
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            timeLabels.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
        }
    }

    // 获取所有唯一的场馆
    const venues = groupDetail.venues || []

    const venueWidth = 150
    const venueHeight = 150
    const timeHeight = 34
    const timeWidth = 80
    const pageWidth = venues.length * venueWidth + timeWidth + 'px'
    const timeStep = 15

    const [now, setNow] = useState<dayjs.Dayjs>(dayjs.tz(new Date(), groupDetail.timezone!))
    const totalMinutes = now.diff(now.startOf('day'), 'minute');


    useEffect(() => {
         // scroll cursor to view
         const cursor = document.getElementById('curr-time-cursor')
         if (cursor) {
             cursor.scrollIntoView({ behavior: 'smooth', block: 'center' })
         }
        
         const interval = setInterval(() => {
            setNow(dayjs.tz(new Date(), groupDetail.timezone!))
        }, 1000 * 60)
        return () => clearInterval(interval)
       
    }, [])

    
    return (
        <div className="" style={{width: pageWidth}}>
            <div className="py-3 sm:py-5 w-full flex flex-row justify-between px-4 schedule-gradient">
                <div className="sm:text-2xl text-xl">
                    <a href={data.eventHomeUrl} className="font-semibold text-[#6CD7B2] mr-2" target={data.isIframe ? "_blank" : "_self"}>
                        {data.group.nickname || data.group.handle}
                    </a>
                    <span className="whitespace-nowrap">{lang['Event Schedule']}</span>
                </div>
            </div>
            
            <div className="grid sticky top-0 z-20" style={{
                gridTemplateColumns: `${timeWidth}px repeat(${venues.length}, ${venueWidth}px)`,
                gridTemplateRows: `${venueHeight}px`,
            }}>
                <div className="border-r border-b border-t border-gray-200 bg-gray-50 sticky left-0 top-0 z-30" />
                
                {venues.map((venue, index) => (
                    <div key={venue.id} className="border-r border-b border-t flex flex-col justify-center border-gray-200 bg-gray-50 p-2 text-center font-medium">
                        {venue.title}
                    </div>
                ))}
            </div>

            <div className="grid relative" style={{
                gridTemplateColumns: `${timeWidth}px repeat(${venues.length}, ${venueWidth}px)`,
                gridTemplateRows: `repeat(${timeLabels.length}, ${timeHeight}px)`,
            }}>

                {timeLabels.map((time, timeIndex) => (
                    <>
                        <div key={`time-${time}`}
                            style={{
                                gridRow: timeIndex + 1,
                                gridColumn: 1,
                            }}
                            className="sticky left-0 z-10 border-r border-b border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center justify-center">
                            {time}
                        </div>

                        {venues.map((venue, venueIndex) => {
                            return (
                                <div
                                    key={`empty-${venue}-${time}`}
                                    className="border-r border-b border-gray-200"
                                    style={{
                                        gridRow: timeIndex + 1,
                                        gridColumn: venueIndex + 2,
                                    }}
                                />
                            )
                        })}
                    </>
                ))}

                {
                    events.map((event, eventIndex) => {
                        if (!event.venue) {
                            return null
                        }

                        const startTime = dayjs(event.start_time)
                        const endTime = dayjs(event.end_time)
                        const duration = endTime.diff(startTime, 'minutes')
                        const venueIndex = venues.findIndex(v => v.id === event.venue?.id)

                        const x = venueIndex + 1
                        const y = timeLabels.findIndex(t => t === event.timeStr)
                        const height = duration / timeStep * timeHeight

                        return <VenueViewEventItem
                        width={venueWidth}
                        lang={lang}
                        event={event}
                        height={`${height}px`}
                        top={`${y * timeHeight}px`}
                        left={`${x * venueWidth - (venueWidth - timeWidth)}px`}
                    />
                    })
                }

                <div id="curr-time-cursor" className='w-full absolute border-t border-red-500 text-white'
                    style={{
                        zIndex: 10,
                        top: `${totalMinutes / timeStep * timeHeight}px`,
                        left: 0,
                        height: '1px',
                    }}
                >

                    <span className="text-xs bg-red-500  px-3 rounded-full translate-y-[-82%] inline-flex translate-x-1 font-semibold">
                        {now.format('HH:mm')}
                        </span>
                </div>
            </div>
        </div>
    )
}