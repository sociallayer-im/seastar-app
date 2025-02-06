import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'
import {getProfileEventByHandle, getStaredEvent} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'

export default async function MyEventsStaredPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle(currProfile.handle)
    const startedEvents = await getStaredEvent((await getServerSideAuth())!)

    const stared = setEventAttendedStatus({
        events: startedEvents,
        currProfileAttends: profileEvents.attends,
        currProfile
    })

    return {
        currProfile,
        stared
    }
}