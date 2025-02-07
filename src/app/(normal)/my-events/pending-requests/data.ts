import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'
import {getMyPendingApprovalEvent, getProfileEventByHandle} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsPendingRequestPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle({
        params: {handle: currProfile.handle},
        clientMode: CLIENT_MODE
    })
    const pendingRequestEvents = await getMyPendingApprovalEvent({
        params: {authToken: (await getServerSideAuth())!},
        clientMode: CLIENT_MODE
    })

    const pendingRequests = setEventAttendedStatus({
        events: pendingRequestEvents,
        currProfileAttends: profileEvents.attends,
        currProfile
    })

    return {
        currProfile,
        pendingRequests
    }
}