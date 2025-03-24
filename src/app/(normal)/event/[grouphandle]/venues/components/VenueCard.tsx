import {Dictionary} from '@/lang'
import {VenueDetail} from '@sola/sdk'

interface VenueCardProps {
    venue: VenueDetail
    lang: Dictionary
    groupHandle: string
    onRemove: (venueId: number) => void
}

export default function VenueCard({venue, lang, groupHandle, onRemove}: VenueCardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-6 hover:scale-[1.02] transition-all duration-300">
            <div className="flex gap-6">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-4">{venue.title}</h2>
                    <div className="space-y-3 text-[15px]">
                        <div className="flex items-center">
                            <span className="text-gray-500">Capacity:</span>
                            <span className="ml-2 text-gray-900">{venue.capacity}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500">Opening date:</span>
                            <span className="ml-2 text-gray-900">12 Mar - 20 Mar</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500">Address:</span>
                            <span className="ml-2 text-gray-900">9 Bras Basah Road</span>
                        </div>
                    </div>
                </div>
                <div className="w-[120px] h-[120px] rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=500"
                        alt={venue.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
                <a href={`/event/${groupHandle}/venues/edit/${venue.id}`}
                   className="text-gray-600 hover:text-gray-900 flex items-center">
                    <i className="uil-edit-alt mr-1"/>
                    {lang['Edit']}
                </a>
                <button
                    onClick={() => onRemove(venue.id)}
                    className="text-red-600 hover:text-red-700 flex items-center">
                    <i className="uil-trash-alt mr-1"/>
                    {lang['Remove']}
                </button>
            </div>
        </div>
    )
} 