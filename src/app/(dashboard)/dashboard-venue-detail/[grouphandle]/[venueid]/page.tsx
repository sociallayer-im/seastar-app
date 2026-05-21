import {selectLang} from "@/app/actions"
import EditVenueData, {EditVenuePageProps} from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/data'
import {VenueAvailability, VenueDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {formatVenueDate, prefixUrl} from '@/utils'

export const dynamic = 'force-dynamic'

export default async function EditVenuePage(props: EditVenuePageProps) {
    const {lang} = await selectLang()
    const { venueDetail } = await EditVenueData({checkPermissions: false, ...props})

    return <VenueDetailPage venue={venueDetail} lang={lang} />
}

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

function renderIntervals(intervals: [string, string][], lang: Dictionary) {
    if (intervals.length === 0) return <div className="text-red-400">{lang['Unavailable']}</div>
    return intervals.map(([s, e], i) => <div key={i}>{s} - {e}</div>)
}

function VenueDetailPage({venue, lang}: {venue: VenueDetail, lang: Dictionary}) {
    const availabilities: VenueAvailability[] = venue.availabilities || []
    const hasWeeklySlots = availabilities.some(a => a.day_of_week && !a.day)
    const dateOverrides = availabilities.filter(a => a.day && !a.day_of_week)

    return <div className="bg-[--background] sm:px-4 rounded-lg px-3 py-4">
        {!!venue.image_urls?.length &&
            <div className="flex-row-item-center overflow-auto mb-6">
                {venue.image_urls.map((img, index) => {
                    return <img
                        className="h-[200px] w-auto mr-4"
                        key={index}
                        src={img} alt=""/>
                })}
            </div>
        }

        <div className="font-semibold text-2xl">{venue.title}</div>
        <div className="text-gray-500">{venue.about}</div>
        <div className="space-y-1 text-sm mt-6 ">
            <div className="flex">
                <span className="mr-1">{lang['Capacity']}:</span>
                <span>{venue.capacity || lang['Unlimited']}</span>
            </div>
            <div className="flex">
                <span className="mr-1">{lang['Available Date']}:</span>
                <span>{formatVenueDate(venue, lang)}</span>
            </div>
            <div className="flex">
                <span className="mr-1">{lang['Location']}:</span>
                <span>{venue.formatted_address || ''}</span>
            </div>
            {!!venue.link &&
                <div className="flex">
                    <span className="mr-1">Link:</span>
                    <a href={prefixUrl(venue.link)} target={'_blank'} className="text-blue-500 break-all">{venue.link}</a>
                </div>
            }
        </div>

        <div className="my-6">
            {!!venue.amenities?.length &&
                <div className="my-3">
                    <div className="font-semibold mb-1 text-lg">{lang['Amenities']}</div>
                    <div className="flex flex-row flex-wrap text-sm">
                        {venue.amenities.map((amenitie, index) => {
                            return <div className="mr-4 shrink-0 whitespace-nowrap" key={index}>{amenitie}</div>
                        })}
                    </div>
                </div>
            }

            <div className="my-6">
                <div className="font-semibold mb-1 text-lg">{lang['Timeslots']}</div>
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
