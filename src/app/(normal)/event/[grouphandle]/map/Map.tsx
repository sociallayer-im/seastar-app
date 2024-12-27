'use client'

import GoogleMapProvider from "@/providers/GoogleMapProvider"
import {Map, AdvancedMarker} from '@vis.gl/react-google-maps'
import {Button} from '@/components/shadcn/Button'
import CardEvent from "@/components/CardEvent"
import {SampleEventWithCreatorAndJoinStatus} from "@/app/(normal)/profile/[handle]/TabEvents/data"
import {useEffect, useState, useRef} from 'react'

interface GroupedEvents {
    [index: string]: SampleEventWithCreatorAndJoinStatus[]
}

export default function EventMap(props: {events: SampleEventWithCreatorAndJoinStatus[]}) {
    const eventsHasLocation = props.events.filter(event => event.geo_lat && event.geo_lng)

    // grouped event with same lat lng
    const groupedEvents = eventsHasLocation.reduce((acc: GroupedEvents, event) => {
        const key = `${event.geo_lat}_${event.geo_lng}`
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(event)
        return acc
    }, {})

    const eventBarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = (e: Event) => {
            eventBarRef.current!.scrollLeft = eventBarRef.current!.scrollLeft + (e as WheelEvent).deltaY
        }

        const a = setInterval(() => {
            if (!!eventBarRef.current) {
                eventBarRef.current?.addEventListener('wheel', handleScroll)
                clearInterval(a)
            }
        }, 100)

        return () => {
            clearInterval(a)
            eventBarRef.current?.removeEventListener('wheel', handleScroll)
        }
    }, [])

    const [currGroupEventsKey, setcurrGroupEventsKey] = useState<keyof GroupedEvents | undefined>(Object.keys(groupedEvents)[0] as keyof SampleEventWithCreatorAndJoinStatus)

    return <div className='w-full h-[calc(100svh-48px)] relative outline-none'>
        <GoogleMapProvider>
            <Map mapId="e2f9ddc0facd5a80"
                defaultCenter={{ lat: Number(eventsHasLocation[0]!.geo_lat!),lng: Number(eventsHasLocation[0]!.geo_lng!)}}
                defaultZoom={15}
                disableDefaultUI>
                {
                    Object.keys(groupedEvents).map((key: keyof typeof groupedEvents, index) => {
                        return <AdvancedMarker
                            clickable={true}
                            onClick={() => setcurrGroupEventsKey(key)}
                            key={index}
                            position={{lat: Number(groupedEvents[key][0].geo_lat!),lng: Number(groupedEvents[key][0].geo_lng!)}}>
                            <div className="flex flex-col items-center">
                                <Button
                                    key={index}
                                    style={currGroupEventsKey === key ? {background: 'linear-gradient(276deg,#f7df3a -18.27%,#d2f8e8 59.84%)'} : undefined}
                                    className="text-sm shadow !bg-background"
                                    variant='secondary'
                                    size="sm"
                                ><div className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                                        <span>{groupedEvents[key][0].title}</span>
                                        {
                                            groupedEvents[key].length > 1 && <span className="ml-2 font-normal text-xs">+{groupedEvents[key].length - 1} Events</span>
                                        }
                                    </div>
                                </Button>
                                <img className="w-[18px] h-auto" src="/images/map_marker.png" alt=""/>
                            </div>
                        </AdvancedMarker>
                    })
                }
            </Map>
        </GoogleMapProvider>
        <div className="flex-row-item-center absolute top-3  justify-start md:justify-center w-full flex-nowrap overflow-auto">
            <Button variant={'primary'} size="sm" className="ml-3 text-sm">Create a marker</Button>
            <Button variant={'primary'} size="sm" className="ml-3 text-sm">Share me</Button>
            <Button variant={'secondary'} size="sm" className="bg-background ml-3 text-sm">Event</Button>
            <Button variant={'secondary'} size="sm" className="bg-background ml-3 text-sm">Share</Button>
            {Array(5).fill(0)
                .map((_, i) => <Button key={i} variant={'secondary'} size="sm" className="bg-background ml-3 text-sm">Type {i}</Button>)}
        </div>

        <div ref={eventBarRef}
            className="hide-scroll flex-row-item-center absolute bottom-0 py-7 px-3 max-w-[98vw] left-[50%] translate-x-[-50%] flex-nowrap overflow-auto">
            {
                !!currGroupEventsKey && groupedEvents[currGroupEventsKey].map((event, index) => {
                    return <CardEvent key={index}
                        id={`event_${event.id}`}
                        event={event}
                        className="mr-3 h-[190px] max-w-[630px] w-[calc(100vw-24px)] flex-shrink-0 flex-grow-0"/>
                })
            }
        </div>
    </div>

}
