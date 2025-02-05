import {getGroupDetailByHandle, MarkerDraft} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'

export type CreateMarkerDataParams= {
    grouphandle: string
}

export interface CreateMarkerDataProps {
    params: CreateMarkerDataParams
}

export const emptyMarker: MarkerDraft = {
    group_id: 0,
    category: null,
    cover_image_url: null,
    title: '',
    about: null,
    link: null,
    location: null,
    formatted_address: null,
    geo_lat: null,
    geo_lng: null,
    location_data: null,
    start_time: null,
    end_time: null,
    badge_class_id: null,

}

export default async function CreateMarkerData({params}: CreateMarkerDataProps) {
    const {grouphandle} = params

    const groupDetail = await getGroupDetailByHandle(grouphandle)
    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect('/')
    }



    return {
        currProfile,
        groupDetail,
        markerDraft: {
            ...emptyMarker,
            group_id: groupDetail.id,
        }
    }
}