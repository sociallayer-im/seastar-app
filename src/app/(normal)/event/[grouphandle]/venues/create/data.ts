import {getGroupDetailByHandle, VenueDetail, VenueOverride, VenueTimeslot} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'

export interface CreateVenueParams {
    grouphandle: string
}

export interface CreateVenueDataProps {
    params: CreateVenueParams
}

export default async function CreateVenueData({params: {grouphandle}}: CreateVenueDataProps) {
    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect(`/event/${groupDetail.handle}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)
    if (!isManager) {
        redirect(`/event/${groupDetail.handle}`)
    }

    const emptyVenue = {
        title: '',
        visibility: 'all',
        formatted_address: null,
        location:'',
        about: '',
        group_id: groupDetail.id,
        geo_lat: null,
        geo_lng: null,
        location_data: null,
        start_date: null,
        end_date: null,
        link: null,
        capacity: null,
        require_approval: false,
        venue_timeslots:[] as VenueTimeslot[],
        venue_overrides: [] as VenueOverride[],
        image_urls: [] as string[],
        amenities: [] as string[],
    } as VenueDetail

    return {
        currProfile,
        groupDetail,
        emptyVenue,
    }
}