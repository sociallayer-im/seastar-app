import {getGroupDetailByHandle, getVenueDetailById} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'

export interface EditVenueParams {
    grouphandle: string
    venueid: string
}

export interface EditVenuePageProps {
    params: EditVenueParams
}

export interface EditVenueProps extends EditVenuePageProps {
    checkPermissions?: boolean
}

export default async function EditVenueData({params, checkPermissions=true} : EditVenueProps) {
    const {grouphandle, venueid} = params

    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const venueDetail = await getVenueDetailById({
        params: {venueId: parseInt(venueid)},
        clientMode: CLIENT_MODE
    })

    if (!venueDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    if (!currProfile && checkPermissions) {
        redirect(`/event/${groupDetail.handle}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    if (!isManager && checkPermissions) {
        redirect(`/event/${groupDetail.handle}`)
    }

    return {groupDetail, currProfile, venueDetail}
}