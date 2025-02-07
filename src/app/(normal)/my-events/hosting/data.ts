import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'
import {getProfileEventByHandle} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsHostingPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle({
        params: {handle: currProfile.handle},
        clientMode: CLIENT_MODE
    })

    const hosting = setEventAttendedStatus({
        events: profileEvents.hosting,
        currProfileAttends: profileEvents.attends,
        currProfile
    })

    return {
        currProfile,
        hosting
    }
}