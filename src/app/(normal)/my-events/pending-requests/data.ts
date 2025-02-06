import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'
import {getMyPendingApprovalEvent, getProfileEventByHandle} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'

export default async function MyEventsPendingRequestPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle(currProfile.handle)
    const pendingRequestEvents = await getMyPendingApprovalEvent((await getServerSideAuth())!)

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