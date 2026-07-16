import {getGroupDetailByName, VenueAvailability} from '@sola/sdk'
import {VenueDraft} from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/VenueForm'
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
    const groupDetail = await getGroupDetailByName({
        params: {groupName: grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect(`/event/${groupDetail.name}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)
    if (!isManager) {
        redirect(`/event/${groupDetail.name}`)
    }

    const emptyVenue = {
        name: '',
        formatted_address: null,
        location: '',
        about: '',
        group_id: groupDetail.id,
        geo_lat: null,
        geo_lng: null,
        location_data: null,
        website: null,
        capacity: null,
        require_approval: false,
        availabilities: [] as VenueAvailability[],
        image_urls: [] as string[],
        amenities: [] as string[],
    } as unknown as VenueDraft

    return {
        currProfile,
        groupDetail,
        emptyVenue,
    }
}