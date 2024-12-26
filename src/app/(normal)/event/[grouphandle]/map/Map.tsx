'use client'

import GoogleMapProvider from "@/providers/GoogleMapProvider"
import {Map, AdvancedMarker} from '@vis.gl/react-google-maps'
import {Button} from '@/components/shadcn/Button'
import CardEvent from "@/components/CardEvent"
import {SampleEventWithCreatorAndJoinStatus} from "@/app/(normal)/profile/[handle]/TabEvents/data"
import {useState} from 'react'

export default function EventMap(props: {events: SampleEventWithCreatorAndJoinStatus[]}) {
    const eventsHasLocation = props.events.filter(event => event.geo_lat && event.geo_lng)

    // grouped event with same lat lng
    const groupedEvents = eventsHasLocation.reduce((acc: {[index: string]: SampleEventWithCreatorAndJoinStatus[]}, event) => {
        const key = `${event.geo_lat}_${event.geo_lng}`
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(event)
        return acc
    }, {})

    const [currEventId, setCurrEventId] = useState<number | null>(null)

    const handleSelectEvent = (id: number) => {
        setCurrEventId(id)
        document.querySelector(`#event_${id}`)?.scrollIntoView({behavior: 'smooth', inline: 'center'})
    }

    return <GoogleMapProvider>
        <div className='w-full h-[calc(100svh-48px)] relative outline-none'>
            <Map mapId="e2f9ddc0facd5a80"
                defaultCenter={{ lat: Number(eventsHasLocation[0]!.geo_lat!),lng: Number(eventsHasLocation[0]!.geo_lng!)}}
                defaultZoom={17}
                disableDefaultUI>
                {
                    Object.keys(groupedEvents).map((key: keyof typeof groupedEvents, index) => {
                        return <AdvancedMarker
                            clickable={true}
                            key={index}
                            position={{lat: Number(groupedEvents[key][0].geo_lat!),lng: Number(groupedEvents[key][0].geo_lng!)}}>

                            <div className="grid grid-cols-3 gap-2  p-4 rounded-lg">
                                {
                                    groupedEvents[key].map((event, index) => {
                                        return <Button
                                            key={index}
                                            className="text-sm shadow !bg-background"
                                            onClick={() => handleSelectEvent(event.id)}
                                            variant='secondary'
                                            size="sm"
                                        ><div className="max-w-[130px] overflow-ellipsis whitespace-nowrap overflow-hidden">
                                                {event.title}</div>
                                        </Button>
                                    })
                                }
                            </div>
                        </AdvancedMarker>
                    })
                }
            </Map>

            <div className="flex-row-item-center absolute top-3 justify-center w-full flex-nowrap overflow-auto">
                <Button variant={'primary'} size="sm" className="mr-3 text-sm">Create a marker</Button>
                <Button variant={'primary'} size="sm" className="mr-3 text-sm">Share me</Button>
                <Button variant={'secondary'} size="sm" className="bg-background mr-3 text-sm">Event</Button>
                <Button variant={'secondary'} size="sm" className="bg-background mr-3 text-sm">Share</Button>
                {Array(5).fill(0)
                    .map((_, i) => <Button key={i} variant={'secondary'} size="sm" className="bg-background mr-3 text-sm">Type {i}</Button>)}
            </div>

            <div className="hide-scroll flex-row-item-center absolute bottom-0 py-7 w-[98vw] left-[50%] translate-x-[-50%] flex-nowrap overflow-auto">
                {
                    eventsHasLocation.map((event, index) => {
                        return <CardEvent key={index}
                            id={`event_${event.id}`}
                            style={{background: currEventId === event.id ? 'linear-gradient(276deg,#f7df3a -18.27%,#d2f8e8 59.84%)' : '#fff'}}
                            event={event}
                            className="mr-4 h-[190px] max-w-[630px] w-[95vw] flex-shrink-0 flex-grow-0"/>
                    })
                }
            </div>
        </div>
    </GoogleMapProvider>
}
