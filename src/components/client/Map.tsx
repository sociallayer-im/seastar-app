'use client'

import GoogleMapProvider from "@/providers/GoogleMapProvider"
import {Map, AdvancedMarker, useMap, MapEvent, MapMouseEvent} from '@vis.gl/react-google-maps'
import {Button} from '@/components/shadcn/Button'
import {useMemo, useState, useEffect} from 'react'

export interface GoogleMapMarkerProps {
    position: { lat: number, lng: number }
    title: string,
    pinIcon?: string
    onClick?: () => void
}

export interface GoogleMapProps {
    center?: { lat: number, lng: number }
    defaultZoom?: number
    markers: GoogleMapMarkerProps[]
    langType?: string
}

export default function GoogleMap({
                                      center = {lat: -34.397, lng: 150.644},
                                      markers,
                                      langType,
                                      defaultZoom = 15
                                  }: GoogleMapProps) {
    const [mapCenter, setMapCenter] = useState(center)
    const [pickingLocation, setPickingLocation] = useState(false)

    const markersToShow = useMemo(() => {
        // set the layer of center marker to the top,
        const centerMarker = markers.find(marker => marker.position.lat === mapCenter.lat && marker.position.lng === mapCenter.lng)
        if (centerMarker) {
            return [...markers.filter(marker => marker !== centerMarker), centerMarker]
        } else {
            return markers
        }
    }, [mapCenter])

    const handleMapClick = (e: MapMouseEvent) => {
        const location = e.detail.latLng
        window.postMessage({type: 'picked-location', location}, window.location.origin)
        setPickingLocation(false)
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        const handlePickLocation = (e: MessageEvent) => {
            if (e.data.type === 'pick-location') {
                setPickingLocation(true)
            }
        }

        window.addEventListener('message', handlePickLocation)
        return () => {
            window.removeEventListener('message', handlePickLocation)
        }
    }, [])

    return <GoogleMapProvider langType={langType}>
        <Map mapId="e2f9ddc0facd5a80"
             defaultCenter={mapCenter}
             defaultZoom={defaultZoom}
             onClick={pickingLocation ? handleMapClick : undefined}
             className={pickingLocation ? 'picking-location' : undefined}
             disableDefaultUI>
            {
                markersToShow.map((marker, index) => {
                    const selected = mapCenter.lat === marker.position.lat && mapCenter.lng === marker.position.lng
                    return <MapMarker
                        onClick={() => setMapCenter(marker.position)}
                        marker={marker}
                        selected={selected}
                        key={JSON.stringify(marker.position) + index}/>
                })
            }
        </Map>
    </GoogleMapProvider>
}

export function MapMarker({marker, selected, onClick}: {
    marker: GoogleMapMarkerProps,
    selected: boolean,
    onClick?: () => void
}) {
    const map = useMap()
    const handleClick = () => {
        if (map) {
            map.panTo(marker.position)
        }
        onClick && onClick()
        !!marker.onClick && marker.onClick()
    }

    return <AdvancedMarker
        clickable={true}
        onClick={handleClick}
        position={marker.position}>
        <div className="flex flex-col items-center">
            <Button
                style={selected ? {background: 'linear-gradient(276deg,#f7df3a -18.27%,#d2f8e8 59.84%)'} : undefined}
                className="text-sm shadow !bg-background"
                variant='secondary'
                size="sm"
            >
                <div className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                    {marker.title}
                </div>
            </Button>
            <img className="w-[18px] h-auto" src={marker.pinIcon || '/images/map_marker.png'} alt=""/>
        </div>
    </AdvancedMarker>
}