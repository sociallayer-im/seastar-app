'use client'

import {buttonVariants} from '@/components/shadcn/Button'
import CardEvent from "@/components/CardEvent"
import {useEffect, useState, useRef} from 'react'
import {Dictionary} from '@/lang'
import GoogleMap, {GoogleMapMarkerProps} from '@/components/client/Map'
import {EventWithJoinStatus} from '@/utils'
import {MARKER_TYPES} from '@/app/(normal)/map/[grouphandle]/marker/marker_type'
import {GroupDetail} from '@sola/sdk'

interface GroupedEvents {
    [index: string]: EventWithJoinStatus[]
}

export interface EventMapProps {
    events: EventWithJoinStatus[]
    lang: Dictionary
    langType: string
    targetEventId?: number
    groupDetail: GroupDetail
}

export default function EventMap(props: EventMapProps) {
    const eventsHasLocation = props.events.filter(event => event.geo_lat && event.geo_lng)
    const targetEvent = eventsHasLocation.find(event => event.id === props.targetEventId)

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

    const [currGroupEventsKey, setCurrGroupEventsKey] = useState<keyof GroupedEvents | undefined>(targetEvent
        ? `${targetEvent.geo_lat}_${targetEvent.geo_lng}`
        : Object.keys(groupedEvents)[0] as any)

    useEffect(() => {
        eventBarRef.current!.scrollLeft = 0
    }, [currGroupEventsKey]);

    const center = targetEvent
        ? {lat: Number(targetEvent.geo_lat!), lng: Number(targetEvent.geo_lng!)}
        : !!eventsHasLocation[0]
            ? {lat: Number(eventsHasLocation[0]!.geo_lat!), lng: Number(eventsHasLocation[0]!.geo_lng!)}
            : {lat: -34.397, lng: 150.644}

    return <div className='w-full h-[calc(100svh-48px)] relative outline-none'>
        <GoogleMap
            center={center}
            markers={Object.keys(groupedEvents).map((key: keyof typeof groupedEvents, index) => ({
                position: {lat: Number(groupedEvents[key][0].geo_lat!), lng: Number(groupedEvents[key][0].geo_lng!)},
                title: `${groupedEvents[key].length}${props.lang['Upcoming Events']}`,
                onClick: () => setCurrGroupEventsKey(key),
            } as GoogleMapMarkerProps))}
            langType={props.langType}/>
        <div
            className="flex-row-item-center absolute top-3  justify-start md:justify-center w-full flex-nowrap overflow-auto">

            <a className={`${buttonVariants({
                variant: 'primary',
                size: 'sm'
            })} bg-background ml-3 text-sm`}>
                <i className="uil-plus-circle text-lg"/>
                {props.lang['Create a Marker']}
            </a>

            <a className={`${buttonVariants({
                variant: 'normal',
                size: 'sm'
            })} bg-background ml-3 text-sm`}
            >{props.lang['Events']}</a>

            {MARKER_TYPES.map((type, i) => {
                return <a key={i}
                          href={`/map/${props.groupDetail.handle}/marker?category=${decodeURIComponent(type.category)}`}
                          className={`${buttonVariants({
                              variant: 'secondary',
                              size: 'sm'
                          })} bg-background ml-3 text-sm`}>
                    {type.label}
                </a>
            })}
        </div>

        {(!currGroupEventsKey || !groupedEvents[currGroupEventsKey].length) &&
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black opacity-30 py-3 px-6 font-semibold rounded-full">
                No Items
            </div>
        }

        <div ref={eventBarRef}
             className="flex-row-item-center absolute bottom-3 py-3 max-w-[calc(100%-24px)] left-[50%] translate-x-[-50%] flex-nowrap overflow-auto">
            {
                !!currGroupEventsKey && groupedEvents[currGroupEventsKey].map((event, index) => {
                    return <CardEvent key={index}
                                      id={`event_${event.id}`}
                                      event={event}
                                      className="mr-3 h-[230px] max-w-[630px] w-[calc(100vw-24px)] flex-shrink-0 flex-grow-0"/>
                })
            }
        </div>
    </div>
}
