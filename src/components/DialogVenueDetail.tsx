import {Dictionary} from "@/lang"
import {VenueAvailability, VenueDetail} from '@sola/sdk'

export interface DialogVenueDetailProps {
    venue: VenueDetail
    lang: Dictionary
}

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

function renderIntervals(intervals: [string, string][], lang: Dictionary) {
    if (intervals.length === 0) return <div className="text-red-400">{lang['Unavailable']}</div>
    return intervals.map(([s, e], i) => <div key={i}>{s} - {e}</div>)
}

export default function DialogVenueDetail({venue, lang}: DialogVenueDetailProps) {
    const availabilities: VenueAvailability[] = venue.availabilities || []
    const hasWeeklySlots = availabilities.some(a => a.day_of_week && !a.day)
    const dateOverrides = availabilities.filter(a => a.day && !a.day_of_week)

    return <div className="w-[340px] h-auto p-4 bg-background shadow rounded-lg">
        <div className="text-lg font-semibold mb-4">{lang['Venue Timeslots']}</div>

        <div className="max-h-[60svh] overflow-auto">
            {(!!venue.start_date || !!venue.end_date) &&
                <div className="mb-6">
                    <div className="font-semibold mb-1">{lang['Available Date']}</div>
                    <div className="flex-row-item-center text-sm">
                        {!!venue.start_date && <div className="mr-1">{lang['From']} <b>{venue.start_date}</b></div>}
                        {!!venue.end_date && <div>{lang['To']} <b>{venue.end_date}</b></div>}
                    </div>
                </div>
            }

            <div>
                <div className="font-semibold mb-1">{lang['Timeslots']}</div>
                {!hasWeeklySlots
                    ? <div>7*24 Hours</div>
                    : <div>
                        {WEEK_DAYS.map((day, idx) => {
                            const slot = availabilities.find(a => a.day_of_week === day && !a.day)
                            return <div key={idx}
                                className="text-sm flex-row-item-center capitalize justify-between my-1 px-3 py-1 bg-secondary rounded-lg">
                                <div className="font-semibold">{lang[day as keyof Dictionary]}</div>
                                <div className="flex flex-col items-end">
                                    {slot ? renderIntervals(slot.intervals as [string, string][], lang)
                                        : <div className="text-red-400">{lang['Unavailable']}</div>}
                                </div>
                            </div>
                        })}
                    </div>
                }
            </div>

            <div className="mt-6">
                <div className="font-semibold mb-1">{lang['Overrides']}</div>
                {dateOverrides.length === 0
                    ? <div>No Overrides</div>
                    : dateOverrides.map((a, idx) => (
                        <div key={idx}
                            className="text-sm flex-row-item-center capitalize justify-between my-1 px-3 py-1 bg-secondary rounded-lg">
                            <div className="font-semibold">
                                {a.intervals.length === 0
                                    ? <div className="text-red-400">{lang['Unavailable']}</div>
                                    : <div>{lang['Available']}</div>}
                            </div>
                            <div>
                                {a.intervals.length === 0
                                    ? a.day
                                    : (a.intervals as [string, string][]).map(([s, e]) => `${a.day}, ${s}-${e}`).join(' / ')}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </div>
}
