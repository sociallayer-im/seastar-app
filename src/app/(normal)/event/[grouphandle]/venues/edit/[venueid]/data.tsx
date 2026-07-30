import {getGroupDetailByName, getVenueDetailById} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
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

    const groupDetail = await getGroupDetailByName({
        params: {groupName: grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    // Signed-in viewers fetch with their token: the endpoint is public, but an
    // editor should not be served a cached anonymous response.
    const authToken = await getServerSideAuth()

    const venueDetail = await getVenueDetailById({
        params: {venueId: venueid, authToken},
        clientMode: CLIENT_MODE
    })

    if (!venueDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    if (!currProfile && checkPermissions) {
        redirect(`/event/${groupDetail.name}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    if (!isManager && checkPermissions) {
        redirect(`/event/${groupDetail.name}`)
    }

    return {groupDetail, currProfile, venueDetail}
}