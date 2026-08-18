'use client'

import { GroupDetail, search, VenueDetail } from "@sola/sdk"
import { IframeSchedulePageDataType } from "@/app/(iframe)/schedule/utils"
import { Dictionary } from "@/lang"
import { IframeSchedulePageDataEventDetail, calculateGridPosition } from "./data"
import dayjs from "@/libs/dayjs"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import VenueViewEventItem from "./VenueViewEventItem"
import DatePicker from "@/components/client/DatePicker"
import { Input } from "@/components/shadcn/Input"
import { cfImage, getAuth } from "@/utils"
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
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const { showLoading, closeModal } = useModal()

    // One label per hour — grid lines are hourly, events are still positioned by minute
    const timeLabels = Array.from({length: 24}, (_, h) =>
        `${h.toString().padStart(2, '0')}:00`
    )

    // 获取所有唯一的场馆
    const venues = useMemo(() => {
        const groupVenues = groupDetail.venues || []
        // An event's venue isn't guaranteed to be in this group's own venue
        // list (e.g. ethchiangmai2025's events reference 4Seas Nimman venues
        // that were never added to ethchiangmai2025's own `venues`). Without
        // this, that venue has no column below (findIndex returns -1), so the
        // event renders at a negative `left` and is invisible even though it
        // loaded fine — same data, only the venue-grid column lookup fails.
        const knownIds = new Set(groupVenues.map(v => v.id))
        const extraVenues: VenueDetail[] = []
        events.forEach(event => {
            const v = event.venue
            if (v && !knownIds.has(v.id)) {
                knownIds.add(v.id)
                extraVenues.push({ id: v.id, name: v.name, image_urls: [] } as unknown as VenueDetail)
            }
        })
        const allVenues = groupVenues.concat(extraVenues)

        const minVenueLengt = 20
        if (allVenues.length < minVenueLengt) {
            const PlaceholderVenue = {
                id: 0,
                title: '',
                image_urls: [],
            } as unknown as VenueDetail
            return allVenues.concat(PlaceholderVenue).concat(Array(minVenueLengt - allVenues.length).fill(PlaceholderVenue))
        } else {
            return allVenues
        }
    }, [groupDetail.venues, events])

    const venueWidth = 150
    const venueHeight = 110
    const timeHeight = 20
    const timeWidth = 80
    const pageWidth = venues.length * venueWidth + timeWidth + 'px'
    const timeStep = 15

    const [now, setNow] = useState<dayjs.Dayjs>(dayjs.tz(new Date(), groupDetail.timezone!))
    const totalMinutes = now.diff(now.startOf('day'), 'minute')
    const showCursor = useMemo(() => {
        return now.isSame(dayjs.tz(data.currDate, groupDetail.timezone!), 'date')
    }, [now, data.currDate, groupDetail.timezone])

    // Position math doesn't depend on `now` — only recompute when the events/
    // venues actually change, not on every 60s cursor tick.
    const renderedEvents = useMemo(() => events.map((event, eventIndex) => {
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
    }), [events, venues, groupDetail.timezone, lang, venueWidth, timeWidth, timeStep, timeHeight])

    useLayoutEffect(() => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) {
            return
        }

        const eventsWithVenue = events.filter(e => e.venue)
        if (eventsWithVenue.length > 0) {
            const firstEvent = eventsWithVenue.reduce((earliest, e) =>
                e.start_time < earliest.start_time ? e : earliest
            )
            const firstStart = dayjs.tz(new Date(firstEvent.start_time), groupDetail.timezone!)
            const minutesFromMidnight = firstStart.hour() * 60 + firstStart.minute()
            const topPx = minutesFromMidnight / timeStep * timeHeight
            scrollContainer.scrollTop = Math.max(0, topPx)
        } else {
            const cursor = document.getElementById('curr-time-cursor')
            if (cursor) {
                cursor.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [events, groupDetail.timezone])

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs.tz(new Date(), groupDetail.timezone!))
        }, 1000 * 60)

        return () => clearInterval(interval)
    }, [groupDetail.timezone])

    const handleDateChange = async (date: string) => {
        const loading = showLoading()
        try {
            const searchParams = {
                start_date: date
            }
            const { data, events } = await calculateGridPosition({
                searchParams,
                groupDetail,
                authToken: getAuth(),
                currPath: window.location.pathname,
                // Browser-side fetch, never touched by Next.js's server fetch
                // cache — safe to let soon's own Cache-Control govern.
                noCache: false
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
        <div className="w-full overflow-auto flex flex-col h-svh">
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
                        className="ml-2 text-base! w-auto!"
                        readOnly
                        value={data.currDate}
                        endAdornment={<i className="uil-calender text-base" />}
                    />
                </DatePicker>
            </div>
          <div ref={scrollContainerRef} className="max-w-full overflow-auto flex-1" >
          <div className="min-w-full" style={{ width: pageWidth }}>
                <div className="grid sticky top-0 z-20" style={{
                    gridTemplateColumns: `${timeWidth}px repeat(${venues.length}, ${venueWidth}px)`,
                    gridTemplateRows: `${venueHeight}px`,
                }}>
                    <div className="border-r border-b border-t border-gray-200 bg-gray-50 sticky left-0 top-0 z-30" />

                    {venues.map((venue, index) => (
                        <div key={index}
                            className="overflow-hidden text-sm border-r border-b border-t  border-gray-200 bg-gray-50 text-center font-medium relative">
                            {(venue as any).image_urls?.[0] && venue.id !== '' && <img src={cfImage((venue as any).image_urls?.[0], { width: 400, height: 300, fit: 'cover' })} alt="" className="w-full h-full object-cover" />}
                            {!(venue as any).image_urls?.[0] && venue.id !== '' && <img src={'/images/venue_default_bg.jpg'} alt="" className="w-full h-full object-cover opacity-50" />}
                            <div className="font-semibold p-3 absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-end bg-linear-to-b from-transparent via-[rgba(255,255,255,0.8)]  to-[rgba(255,255,255,1)] ">
                                {venue.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid relative" style={{
                    gridTemplateColumns: `${timeWidth}px repeat(${venues.length}, ${venueWidth}px)`,
                    gridTemplateRows: `repeat(${timeLabels.length}, ${timeHeight * 4}px)`,
                }}>

                    {/* Grid lines for the venue area, drawn as one CSS background instead
                        of a border-having <div> per hour x venue cell (24 x venues.length,
                        purely decorative). Same 1px #e5e7eb (gray-200) lines, right/bottom
                        edges of each cell, just not one DOM node per cell. */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: 0,
                            left: timeWidth,
                            width: venues.length * venueWidth,
                            height: timeLabels.length * timeHeight * 4,
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${venueWidth - 1}px, #e5e7eb ${venueWidth - 1}px, #e5e7eb ${venueWidth}px), repeating-linear-gradient(to bottom, transparent 0, transparent ${timeHeight * 4 - 1}px, #e5e7eb ${timeHeight * 4 - 1}px, #e5e7eb ${timeHeight * 4}px)`,
                        }}
                    />

                    {timeLabels.map((time, timeIndex) => (
                        <div key={`time-${time}`}
                            style={{
                                gridRow: timeIndex + 1,
                                gridColumn: 1,
                            }}
                            className="sticky left-0 z-10 border-r border-b-dashed border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center justify-center">
                            {time !== '00:00' && <span className="text-xs translate-y-[-18px]">{time}</span>}
                        </div>
                    ))}

                    {renderedEvents}

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
