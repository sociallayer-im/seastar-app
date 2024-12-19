import DropdownMenu from "@/components/client/DropdownMenu"
import {buttonVariants} from "@/components/shadcn/Button"
import {Badge} from "@/components/shadcn/Badge"
import {LocationInputProps} from "@/components/client/LocationInput/index"
import {MouseEvent, useMemo} from "react"

export interface SelectVenue  extends LocationInputProps {
    onSwitchToCreateLocation: () => void
}

export default function SelectVenue({state: {event, setEvent}, venues, onSwitchToCreateLocation, isManager, isMember}: SelectVenue) {
    const currVenue = venues.find(v => v.id === event.venue_id)

    const setVenue = (venue: Solar.Venue) => {
        if (!venue.id) {
            onSwitchToCreateLocation()
        } else {
            setEvent({
                ...event,
                venue_id: venue.id,
                geo_lng: venue.geo_lng,
                geo_lat: venue.geo_lng,
                formatted_address: venue.formatted_address,
                location_data: venue.location_data,
                location: venue.location
            })
        }
    }

    const reset = (e:MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEvent({
            ...event,
            venue_id: null,
            geo_lng: null,
            geo_lat: null,
            formatted_address: null,
            location_data: null,
            location:null
        })
    }

    const createLocationOpt = {
        id: 0,
        title: `<i class="uil-plus-circle text-lg"></i> Other Location`
    } as Solar.Venue

    const toLink = (url: string) => {
        window.open(url, '_blank')
    }

    const venueOpts = useMemo(() => {
        // check visibility
        return venues.filter(v =>
            (v.visibility === 'manager' && isManager) ||
            (v.visibility === 'member' && isMember) ||
            v.visibility !== 'manager' && v.visibility !== 'member'
        )
    }, [isManager, venues])

    return <div className="mb-8">
        <DropdownMenu
            fixWidth
            options={[createLocationOpt, ...venueOpts]}
            value={currVenue ? [currVenue] : undefined}
            onSelect={(venue) => {
                setVenue(venue[0])
            }}
            renderOption={(venue) => <VenueOpt venue={venue}/>}
            valueKey="id"
        >
            <div
                className={`${buttonVariants({variant: 'secondary'})} w-full !justify-between items-center cursor-pointer`}>
                <div className="overflow-hidden whitespace-nowrap overflow-ellipsis font-normal">
                    <i className="uil-location-point text-lg mr-1"/>
                    {currVenue ? currVenue.title : 'Select Venue'}
                </div>

                <div className='flex items-center'>
                    {!!event.venue_id
                        ? <i className="uil-times-circle text-xl" onClick={e => reset(e)}/>
                        : <img src="/images/dropdown_icon.svg" alt=""/>
                    }
                </div>
            </div>
        </DropdownMenu>
        <div>
            {!!currVenue?.venue_timeslots?.length && <Badge variant="ongoing" className="mr-1 mt-2 cursor-pointer">
                Timeslots
                <i className='uil-search ml-1' />
            </Badge>}
            {!!currVenue?.venue_overrides?.length && <Badge variant="pending" className="mr-1 mt-2 cursor-pointer">
                Overrides
                <i className="uil-search ml-1"/>
            </Badge>}
            {!!currVenue?.link && <Badge variant="hosting" className="mr-1 mt-2 cursor-pointer" onClick={() => {toLink(currVenue?.link)}}>
                Link
                <i className="uil-link ml-1"/>
            </Badge>}
            {!!currVenue?.capacity && <Badge variant="past" className="mr-1 mt-2">{currVenue.capacity} Seats</Badge>}
            {!!currVenue?.require_approval && <Badge variant="upcoming" className="mr-1 mt-2">Need Approval</Badge>}
            {!!currVenue?.about &&
                <div className="text-sm mt-2 text-[#999]"><i className="uil-align-left"></i> {currVenue.about}</div>
            }
        </div>
    </div>
}

function VenueOpt({venue}: { venue: Solar.Venue }) {
    return <div>
        <div className="webkit-box-clamp-1" dangerouslySetInnerHTML={{__html: venue.title}}/>
        <div className="text-sm text-[#999]">
            {!!venue.venue_timeslots?.length && <Badge variant="ongoing" className="mr-1 mt-2">Timeslots</Badge>}
            {!!venue.venue_overrides?.length && <Badge variant="pending" className="mr-1 mt-2">Overrides</Badge>}
            {!!venue.link && <Badge variant="hosting" className="mr-1 mt-2">Link</Badge>}
            {!!venue.capacity && <Badge variant="past" className="mr-1 mt-2">{venue.capacity} Seats</Badge>}
            {!!venue.require_approval && <Badge variant="upcoming" className="mr-1 mt-2">Need Approval</Badge>}
        </div>
        {!!venue.about &&
            <div className="text-sm mt-2 text-[#999]"><i className="uil-align-left"></i> {venue.about}</div>
        }
    </div>
}
