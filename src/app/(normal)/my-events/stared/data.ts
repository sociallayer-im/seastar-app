import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'
import {getProfileEventByHandle, getStaredEvent} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsStaredPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle({
        params: {handle: currProfile.handle},
        clientMode: CLIENT_MODE
    })
    const startedEvents = await getStaredEvent({
        params: {authToken: (await getServerSideAuth())!},
        clientMode: CLIENT_MODE
    })

    const stared = setEventAttendedStatus({
        events: startedEvents,
        currProfileAttends: profileEvents.attends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    return {
        currProfile,
        stared
    }
}