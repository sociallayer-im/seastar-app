'use client'

import {Dictionary} from '@/lang'
import {Venue} from '@sola/sdk'
import Img from '@/components/Img'

// Group detail embeds the light Venue view; images/availabilities are optional extras.
type VenueCardVenue = Venue & {image_urls?: string[], availabilities?: unknown[]}
import {buttonVariants, Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import DialogVenue from '@/components/client/DialogVenue'
import {cfImage} from '@/utils'


interface VenueCardProps {
    venue: VenueCardVenue
    lang: Dictionary
    groupHandle: string
    isManager?: boolean
    onRemove: (venueId: string) => void
}

export default function VenueCard({venue, lang, groupHandle, onRemove, isManager}: VenueCardProps) {

    const {openModal} = useModal()

    const showVenueDetail = () => {
        openModal({
            content: (close) => <DialogVenue
                close={close!}
                groupHandle={groupHandle}
                venue={venue as unknown as import('@sola/sdk').VenueDetail}
                lang={lang}
                isManager={isManager}/>
        })
    }

    return (
        <div onClick={showVenueDetail}
             className="bg-white rounded-lg shadow p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="flex gap-6 sm:flex-row flex-col">
                <div className="flex-1 order-2 sm:order-1">
                    <h2 className="font-semibold mb-1">{venue.name}</h2>
                    <div className="text-gray-500">{venue.about}</div>

                    <div className="space-y-1 text-sm mt-6">
                        <div className="flex">
                            <span className="mr-1">Capacity:</span>
                            <span>{venue.capacity || lang['Unlimited']}</span>
                        </div>
                        <div className="flex">
                            <span className="mr-1">Address:</span>
                            <span>{venue.about || ''}</span>
                        </div>
                    </div>
                </div>
                {!!venue.image_urls?.length &&
                    <div className="w-[140px] h-[140px] rounded-lg overflow-hidden flex-shrink-0  order-1 sm:order-2">
                        <Img
                            src={cfImage(venue.image_urls[0], { width: 400, height: 300, fit: 'cover' })}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                }
            </div>
            {isManager &&
                <div className="flex justify-end gap-1 mt-4">
                    <a href={`/event/${groupHandle}/venues/edit/${venue.id}`}
                       onClick={e => e.stopPropagation()}
                       className={`${buttonVariants({
                           variant: 'secondary',
                           size: 'sm'
                       })} text-gray-600 hover:text-gray-900 flex items-center`}>
                        <i className="uil-edit-alt mr-1"/>
                        {lang['Edit']}
                    </a>
                    <Button
                        variant={'secondary'}
                        size={'sm'}
                        onClick={(e) => {e.stopPropagation();onRemove(venue.id)}}
                        className="!text-red-400 hover:brightness-95 flex items-center">
                        <i className="uil-trash-alt mr-1"/>
                        {lang['Remove']}
                    </Button>
                </div>
            }
        </div>
    )
} 
