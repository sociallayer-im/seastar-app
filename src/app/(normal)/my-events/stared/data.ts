import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getProfileEventByName} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsStaredPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByName({
        params: {name: currProfile.name, authToken: await getServerSideAuth()},
        clientMode: CLIENT_MODE
    })

    const stared = setEventAttendedStatus({
        events: profileEvents.starred,
        currProfileAttends: profileEvents.attends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    return {
        currProfile,
        stared
    }
}