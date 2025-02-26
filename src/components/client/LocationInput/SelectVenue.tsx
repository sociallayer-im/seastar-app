import DropdownMenu from "@/components/client/DropdownMenu"
import {buttonVariants} from "@/components/shadcn/Button"
import {Badge} from "@/components/shadcn/Badge"
import {LocationInputProps} from "./index"
import {MouseEvent, useMemo} from "react"
import {Dictionary} from "@/lang"
import useModal from "@/components/client/Modal/useModal"
import DialogVenueDetail from "@/components/DialogVenueDetail"
import {isEventTimeSuitable} from "@/utils"
import {EventDraftType, VenueDetail} from '@sola/sdk'

export interface SelectVenueProps extends LocationInputProps {
    onSwitchToCreateLocation: () => void
}

export default function SelectVenue({
                                        state: {event, setEvent},
                                        venues,
                                        onSwitchToCreateLocation,
                                        isManager,
                                        isMember,
                                        lang
                                    }: SelectVenueProps) {
    const currVenue = venues.find(v => v.id === event.venue_id)
    const {openModal} = useModal()

    const setVenue = (venue: VenueDetail) => {
        if (!venue.id) {
            onSwitchToCreateLocation()
        } else {
            const eventDraft = {
                ...event,
                venue_id: venue.id,
                geo_lng: venue.geo_lng,
                geo_lat: venue.geo_lat,
                formatted_address: venue.formatted_address,
                location_data: venue.location_data,
                location: venue.location,
                ...(venue.capacity !== undefined && {max_participant: venue.capacity})
            }

            setEvent(eventDraft)
        }
    }

    const reset = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
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

    const createLocationOpt = {
        id: 0,
        title: `<i class="uil-plus-circle text-lg"></i> ${lang['Other Location']}`
    } as VenueDetail

    const toLink = (url: string) => {
        window.open(url, '_blank')
    }

    const venueOpts = useMemo(() => {
        // check visibility
        return venues.filter(v =>
            !v.visibility
            || v.visibility === 'all'
            || (v.visibility === 'manager' && isManager)
            || (v.visibility === 'member' && isMember)
        )
    }, [isManager, venues])

    const showDetail = (venue: VenueDetail) => {
        openModal({
            content: () => <DialogVenueDetail venue={venue} lang={lang}/>,
        })
    }

    return <div>
        <DropdownMenu
            optDividers={true}
            fixWidth
            options={[createLocationOpt, ...venueOpts]}
            value={currVenue ? [currVenue] : undefined}
            onSelect={(venue) => {
                setVenue(venue[0])
            }}
            renderOption={(venue) => <VenueOpt
                venue={venue}
                lang={lang}
                isManager={isManager}
                isMember={isMember}
                event={event}
            />}
            valueKey="id"
        >
            <div
                className={`${buttonVariants({variant: 'secondary'})} w-full !justify-between items-center cursor-pointer`}>
                <div className="overflow-hidden whitespace-nowrap overflow-ellipsis font-normal">
                    <i className="uil-location-point text-lg mr-1"/>
                    {currVenue ? currVenue.title : lang['Select Venue']}
                </div>

                <div className="flex items-center">
                    {!!event.venue_id
                        ? <i className="uil-times-circle text-xl" onClick={e => reset(e)}/>
                        : <img src="/images/dropdown_icon.svg" alt=""/>
                    }
                </div>
            </div>
        </DropdownMenu>
        <div>
            {!!currVenue?.venue_timeslots?.length && <Badge
                onClick={() => {
                    showDetail(currVenue)
                }}
                variant="secondary" className="mr-1 mt-2 cursor-pointer hover:brightness-95">
                {lang['Timeslots']}
                <i className="uil-search ml-1"/>
            </Badge>}
            {!!currVenue?.venue_overrides?.length && <Badge
                onClick={() => {
                    showDetail(currVenue)
                }}
                variant="secondary" className="mr-1 mt-2 cursor-pointer hover:brightness-95">
                {lang['Overrides']}
                <i className="uil-search ml-1"/>
            </Badge>}
            {!!currVenue?.link && <Badge variant="secondary" className="mr-1 mt-2 cursor-pointer hover:brightness-95"
                                         onClick={() => {
                                             toLink(currVenue.link!)
                                         }}>
                {lang['Link']}
                <i className="uil-link ml-1"/>
            </Badge>}
            {!!currVenue?.capacity &&
                <Badge variant="secondary" className="mr-1 mt-2">{currVenue.capacity} {lang['Seats']}</Badge>}
            {!!currVenue?.require_approval &&
                <Badge variant="secondary" className="mr-1 mt-2">{lang['Need Approval']}</Badge>}
            {!!currVenue?.about &&
                <div className="text-sm mt-2 text-[#999]"><i className="uil-align-left"></i> {currVenue.about}</div>
            }
        </div>
        {!!currVenue?.require_approval && !isManager &&
            <div className="text-orange-300 text-xs flex-row-item-center bg-orange-50 px-2 mt-2 py-1 rounded-lg">
                <i className="uil-info-circle text-lg mr-1"/>
                {lang['You will apply to use this venue']}
            </div>
        }
    </div>
}

export interface VenueOptProps {
    venue: VenueDetail
    lang: Dictionary
    isManager: boolean
    isMember: boolean
    event: EventDraftType
}

function VenueOpt({venue, lang, isManager, isMember, event}: VenueOptProps) {
    const inapplicable = isEventTimeSuitable(
        event.timezone!,
        event.start_time,
        event.end_time,
        isManager,
        isMember,
        venue,
    )

    return <div className={`${inapplicable ? 'pointer-events-none' : ''}`}>
        <div className={`${inapplicable ? 'opacity-50' : ''}`}>
            <div className="webkit-box-clamp-1" dangerouslySetInnerHTML={{__html: venue.title}}/>
            <div className="text-sm text-[#999]">
                {!!venue.venue_timeslots?.length &&
                    <Badge variant="secondary" className="mr-1 mt-2">{lang['Timeslots']}</Badge>}
                {!!venue.venue_overrides?.length &&
                    <Badge variant="secondary" className="mr-1 mt-2">{lang['Overrides']}</Badge>}
                {!!venue.link && <Badge variant="secondary" className="mr-1 mt-2">{lang['Link']}</Badge>}
                {!!venue.capacity &&
                    <Badge variant="secondary" className="mr-1 mt-2">{venue.capacity} {lang['Seats']}</Badge>}
                {!!venue.require_approval &&
                    <Badge variant="secondary" className="mr-1 mt-2">{lang['Need Approval']}</Badge>}
            </div>
            {!!venue.about &&
                <div className="text-sm mt-2 text-[#999]"><i className="uil-align-left"></i> {venue.about}</div>
            }
        </div>
        {!!lang[inapplicable as keyof Dictionary] &&
            <div className="text-red-500 text-xs mt-1 flex-row-item-center">
                <i className="uil-info-circle text-base mr-1"/>
                {lang[inapplicable as keyof Dictionary] || ''}
            </div>
        }
    </div>
}
