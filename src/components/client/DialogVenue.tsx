'use client'

import {VenueDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {formatVenueDate, prefixUrl} from '@/utils'
import {buttonVariants} from '@/components/shadcn/Button'

export default function DialogVenue({venue, isManager, lang, groupHandle, close}:{venue: VenueDetail, isManager?: boolean ,lang: Dictionary, groupHandle: string, close: ()=> void}) {
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

    return <div className="sm:max-w-[725px] max-w-[365px] w-[95vw] shadow bg-[--background] sm:px-4 rounded-lg px-3 py-4">
        <div className="flex-row-item-center justify-end mb-1">
            <i className="uil-times text-xl cursor-pointer" onClick={close}/>
        </div>
       <div className="max-h-[80svh] overflow-auto">
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
                               return <div className="mr-4 shrink-0 whitespace-nowrap">{amenitie}</div>
                           })}
                       </div>
                   </div>
               }

               {!venue.venue_timeslots?.length &&
                   <div className="my-6">
                       <div className="font-semibold mb-1 text-lg">{lang['Timeslots']}</div>
                       <div>7*24 Hours</div>
                   </div>
               }

               {!!venue.venue_timeslots?.length &&
                   <div className="my-6">
                       <div className="flex-row-item-center justify-between">
                           <div className="font-semibold mb-1 text-lg">{lang['Timeslots']}</div>
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

           {isManager &&
               <div className="flex justify-end gap-1 mt-4">
                   <a href={`/event/${groupHandle}/venues/edit/${venue.id}`}
                      className={`${buttonVariants({variant: 'ghost', size: 'sm'})} text-primary-foreground`}>
                       <i className="uil-edit-alt mr-1"/>
                       {lang['Edit']}
                   </a>
               </div>
           }
       </div>
    </div>
}