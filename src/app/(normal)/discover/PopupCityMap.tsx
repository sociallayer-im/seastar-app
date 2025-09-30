'use client'

import GoogleMap from '@/components/client/Map'
import {buttonVariants} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import GoogleMapProvider from "@/providers/GoogleMapProvider"
import {useMapsLibrary} from '@vis.gl/react-google-maps'
import {useEffect} from 'react'

export interface MapMarkers {
    position: { lat: number, lng: number },
    title: string
}

export interface PopupCityMapProps {
    lang: Dictionary,
    mapMarkers: MapMarkers[],
    langType?: string
}

export default function PopupCityMap(props: PopupCityMapProps){
    return <GoogleMapProvider langType={props.langType}>
        <PopupCityMapInner {...props}></PopupCityMapInner>
    </GoogleMapProvider>

}

export  function PopupCityMapInner({lang, mapMarkers, langType}: PopupCityMapProps) {
    const geocodingLib = useMapsLibrary('geocoding')
    useEffect(() => {
        !!geocodingLib && console.log('Map library loaded')
    },[geocodingLib])

    return geocodingLib ? <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">{lang['Pop-up Cities']} 2025</h2>
        <div className="w-full h-[260px] mb-6 relative loading-bg rounded-lg">
            <GoogleMap langType={langType} markers={mapMarkers} center={mapMarkers[mapMarkers.length - 1].position}
                       defaultZoom={1}/>
            <a className={`${buttonVariants({
                variant: "secondary",
                size: "sm"
            })} absolute bottom-2 right-2 z-10 text-xs bg-white shadow`}
               href={`/map/popup2025/event`}>
                {lang['Browse on Map']} <i className="uil-expand-arrows-alt text-base"/>
            </a>
        </div>
    </div>: null
}