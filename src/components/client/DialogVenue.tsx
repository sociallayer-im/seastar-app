'use client'

import {VenueDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {formatVenueDate} from '@/utils'
import {buttonVariants} from '@/components/shadcn/Button'

export default function DialogVenue({venue, isManager, lang, groupHandle, close}:{venue: VenueDetail, isManager?: boolean ,lang: Dictionary, groupHandle: string, close: ()=> void}) {
    return <div className="max-h-[90svh] overflow-auto sm:max-w-[725px] max-w-[365px] w-[95vw] shadow bg-[--background] sm:px-4 rounded-lg px-3 py-4">
        <div className="flex-row-item-center justify-end mb-1">
            <i className="uil-times text-xl cursor-pointer" onClick={close}/>
        </div>
        <div className="flex-row-item-center overflow-auto mb-6">
            {new Array(5).fill(0).map((_, index) => {
                return <img
                    className="max-h-[200px] w-auto mr-4"
                    key={index}
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=500" alt=""/>
            })}
        </div>
        <div className="font-semibold text-2xl">{venue.title}</div>
        <div className="text-gray-500">{venue.about}</div>
        <div className="space-y-1 text-sm mt-6 ">
            <div className="flex">
                <span className="mr-1">Capacity:</span>
                <span>{venue.capacity || lang['Unlimited']}</span>
            </div>
            <div className="flex">
                <span className="mr-1">Available Date:</span>
                <span>{formatVenueDate(venue, lang)}</span>
            </div>
            <div className="flex">
                <span className="mr-1">Address:</span>
                <span>{venue.formatted_address || ''}</span>
            </div>
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
}