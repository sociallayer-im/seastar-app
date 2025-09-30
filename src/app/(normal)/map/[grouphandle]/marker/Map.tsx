'use client'

import {useEffect, useState, useRef} from 'react'
import {Dictionary} from '@/lang'
import GoogleMap, {GoogleMapMarkerProps} from '@/components/client/Map'
import {MarkerType} from '@/app/(normal)/map/[grouphandle]/marker/marker_type'
import {GroupDetail, Marker, ProfileDetail} from '@sola/sdk'
import TopBar from '@/app/(normal)/map/[grouphandle]/TopBar'
import {Badge} from '@/components/shadcn/Badge'
import {Button} from '@/components/shadcn/Button'

export interface MarkerMapProps {
    markers: Marker[]
    lang: Dictionary
    langType: string
    groupDetail: GroupDetail
    currCategory: MarkerType | null
    currProfile: ProfileDetail | null
}

export default function MarkerMap({markers, langType, lang, groupDetail, currCategory}: MarkerMapProps) {

    const markerBarRef = useRef<HTMLDivElement>(null)
    const [selectedMarkerId, setSelectedMarkerId] = useState<number | undefined>(markers[0]?.id)
    const [waitingPickLocation, setWaitingPickLocation] = useState(false)

    useEffect(() => {
        const handleScroll = (e: Event) => {
            markerBarRef.current!.scrollLeft = markerBarRef.current!.scrollLeft + (e as WheelEvent).deltaY
        }

        const a = setInterval(() => {
            if (!!markerBarRef.current) {
                markerBarRef.current?.addEventListener('wheel', handleScroll)
                clearInterval(a)
            }
        }, 100)

        return () => {
            clearInterval(a)
            markerBarRef.current?.removeEventListener('wheel', handleScroll)
        }
    }, [])

    const defaultCenter = !!markers[0]
        ? {lat: Number(markers[0]!.geo_lat!), lng: Number(markers[0]!.geo_lng!)}
        : {lat: -34.397, lng: 150.644}

    useEffect(() => {
        if (markerBarRef) {
            document.querySelector(`#marker-${selectedMarkerId}`)?.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
    }, [selectedMarkerId])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const listenPickLocationEvent = (e: MessageEvent) => {
            if (e.data.type === 'pick-location') {
                setWaitingPickLocation(true)
            }
            if (e.data.type === 'picked-location') {
                setWaitingPickLocation(false)
            }
        }
        window.addEventListener('message', listenPickLocationEvent)
        return () => {
            window.removeEventListener('message', listenPickLocationEvent)
        }
    }, [])

    return <div
        className={`w-full h-[calc(100svh-48px)] relative outline-none`}>
        <GoogleMap
            defaultZoom={currCategory ? 15 : 3}
            center={defaultCenter}
            markers={markers.map((m, i) => ({
                position: {lat: Number(m.geo_lat!), lng: Number(m.geo_lng!)},
                title: m.title,
                onClick: () => {
                    setSelectedMarkerId(m.id)
                },
            } as GoogleMapMarkerProps))}
            langType={langType}
        />

        {!waitingPickLocation &&
            <TopBar markerCategory={currCategory ? currCategory.label : 'all'}
                    groupDetail={groupDetail} lang={lang}/>
        }

        {(!markers.length) && !waitingPickLocation &&
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black opacity-30 py-3 px-6 font-semibold rounded-full">
                No Items
            </div>
        }

        {!waitingPickLocation &&
            <div ref={markerBarRef}
                 className="flex-row-item-center absolute bottom-3 py-3 max-w-[calc(100%-24px)] left-[50%] translate-x-[-50%] flex-nowrap overflow-auto">
                {
                    markers.map((marker) => {
                        const style = marker.id === selectedMarkerId ? {background: 'linear-gradient(276deg,#f7df3a -18.27%,#d2f8e8 59.84%)'} : undefined

                        return <a href={`/marker/detail/${marker.id}`}
                                  style={style}
                                  key={marker.id}
                                  id={'marker-' + marker.id}
                                  className={'shadow flex rounded-lg p-3 flex-row flex-nowrap bg-background duration-200 hover:scale-[1.02] mr-3 h-[164px] max-w-[430px] w-[calc(100vw-24px)] flex-shrink-0 flex-grow-0'}>
                            <div className="flex-1 mr-2">
                                <div className="font-semibold text-sm sm:text-base webkit-box-clamp-2 leading-6">
                                    <Badge variant="secondary" className="mr-1">{marker.category}</Badge>
                                    {marker.title}
                                </div>

                                {!!marker.location &&
                                    <div className="h-6 flex-row-item-center text-xs sm:text-sm sm:my-1">
                                        <i className="uil-location-point mr-1 sm:text-lg text-sm"/>
                                        <span
                                            className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis">{marker.location}</span>
                                    </div>
                                }
                            </div>
                            {!!marker.cover_image_url &&
                                <div
                                    className="sm:w-[140px] sm:h-[140px] flex-shrink-0 flex-grow-0 w-[100px] h-[100px]">
                                    <img className="w-full h-full object-cover" src={marker.cover_image_url} alt=""/>
                                </div>
                            }
                        </a>
                    })
                }
            </div>
        }

        {waitingPickLocation &&
            <div
                className="max-w-[98vw] w-[500px] justify-between bg-white shadow rounded-lg shaodw py-2 px-3 flex-row-item-center absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex-row-item-center">
                    <img src="/images/map_marker.png" className="w-4 mr-2" alt=""/>
                    <div>Select a place to create a marker</div>
                </div>
                <Button
                    variant={'destructive'}
                    onClick={() => setWaitingPickLocation(false)}
                >{lang['Cancel']}</Button>
            </div>
        }
    </div>
}
