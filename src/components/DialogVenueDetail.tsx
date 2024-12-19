import {Dictionary} from "@/lang"

export interface DialogVenueDetailProps {
    venue: Solar.Venue
    lang: Dictionary
}

export default function DialogVenueDetail({venue, lang}: DialogVenueDetailProps) {
    const timeslots: {[index: string]: Solar.VenueTimeslot[]} = {
        'monday': [],
        'tuesday': [],
        'wednesday': [],
        'thursday': [],
        'friday': [],
        'saturday': [],
        'sunday': []
    }

    Object.keys(timeslots).forEach((day) => {
        timeslots[day] = venue.venue_timeslots?.filter(timeslot => timeslot.day_of_week === day) || []
    })

    return <div className="w-[340px] h-auto p-4 bg-background shadow rounded-lg">
        <div className="text-lg font-semibold mb-4">{lang['Venue Timeslots']}</div>

        <div className="max-h-[60svh] overflow-auto">
            {!venue.venue_timeslots?.length &&
                <div>
                    <div className="font-semibold mb-1">{lang['Timeslots']}</div>
                    <div>7*24 Hours</div>
                </div>
            }
            {!!venue.venue_timeslots?.length &&
                <div>
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold mb-1">{lang['Timeslots']}</div>
                    </div>
                    <div>
                        {Object.keys(timeslots).map((day, idx) => {
                            return <div key={idx}
                                className="text-sm flex-row-item-center capitalize justify-between my-1 px-3 py-1 bg-secondary rounded-lg">
                                <div className="font-semibold">{lang[day as keyof Dictionary]}</div>
                                <div className="flex flex-col items-end">
                                    {!!timeslots[day].length && timeslots[day][0].disabled
                                        ? <div className="text-red-400">{lang['Unavailable']}</div>
                                        : timeslots[day].map((timeslot, idx) => {
                                            return <div key={idx}>
                                                {timeslot.start_at} - {timeslot.end_at}
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            }
            {!!venue.venue_overrides?.length &&
                <div className="mt-6">
                    <div className="font-semibold mb-1">{lang['Overrides']}</div>
                    <div>
                        {venue.venue_overrides.map((timeslot, idx) => {
                            return <div key={idx}
                                className="text-sm flex-row-item-center capitalize justify-between my-1 px-3 py-1 bg-secondary rounded-lg">
                                <div className="font-semibold">
                                    {!timeslot.disabled
                                        ? <div>{lang['Available']}</div>
                                        : <div className="text-red-400">{lang['Unavailable']}</div>}
                                </div>
                                <div>{!timeslot.disabled ? `${timeslot.day}, ${timeslot.start_at}-${timeslot.end_at}` : timeslot.day}</div>
                            </div>
                        })}
                    </div>
                </div>
            }

            {!venue.venue_overrides?.length &&
                <div>
                    <div className="font-semibold mb-">{lang['Overrides']}</div>
                    <div>No Overrides</div>
                </div>
            }
        </div>
    </div>
}
