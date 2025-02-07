import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getProfileEventByHandle} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsAttendedPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle({
        params: {handle: currProfile.handle},
        clientMode: CLIENT_MODE
    })

    const attends = setEventAttendedStatus({
        events: profileEvents.attends,
        currProfileAttends: profileEvents.attends,
        currProfile
    })

    return {
        currProfile,
        attends
    }
}