import SelectVenue from "@/components/client/LocationInput/SelectVenue"
import {useEffect, useRef, useState} from "react"
import SearchLocation from "@/components/client/LocationInput/SearchLocation"
import {Dictionary} from "@/lang"
import GoogleMapProvider from "@/providers/GoogleMapProvider"
import {EventDraftType, VenueDetail} from '@sola/sdk'
import {LegacyVenueLocation} from '@/utils'

export interface LocationInputProps {
    state: { event: EventDraftType, setEvent: (event: EventDraftType) => void }
    venues: VenueDetail[],
    lang: Dictionary,
    isManager: boolean
    isMember: boolean
}

export default function LocationInput({state: {event, setEvent}, venues, lang, isManager, isMember}: LocationInputProps) {
    const [useVenue, _setUseVenue] = useState(!!event.venue_id || (!event.venue_id && !event.formatted_address))
    const venueCache = useRef<null | VenueDetail>(null)

    useEffect(()=> {
        _setUseVenue(!!event.venue_id || (!event.venue_id && !event.formatted_address))
    }, [event.venue_id, event.formatted_address])

    const setUseVenue = (useVenue: boolean) => {
        if (useVenue) {
            const cached = venueCache.current as (VenueDetail & LegacyVenueLocation) | null
            setEvent({
                ...event,
                venue_id: cached?.id || null,
                geo_lng: cached?.geo_lng || null,
                geo_lat: cached?.geo_lat || null,
                formatted_address: cached?.formatted_address || null,
                location_data: cached?.location_data || null,
                location: cached?.location || null
            })
        } else {
            if (!!event.venue_id) {
                venueCache.current = venues.find(v => {
                    return v.id === event.venue_id
                }) || null
            }

            setEvent({
                ...event,
                venue_id: null,
                geo_lng: null,
                geo_lat: null,
                formatted_address: null,
                location_data: null,
                location: null
            })
        }
        _setUseVenue(useVenue)
    }

    return useVenue ?
        <SelectVenue
            isManager={isManager}
            isMember={isMember}
            lang={lang}
            venues={venues}
            state={{event, setEvent}}
            onSwitchToCreateLocation={() => {
                setUseVenue(false)
            }}/>
        : <GoogleMapProvider>
            <SearchLocation
                isManager={isManager}
                isMember={isMember}
                lang={lang}
                state={{event, setEvent}}
                onSwitchToCreateLocation={() => {
                    setUseVenue(true)
                }}/>
        </GoogleMapProvider>
}
