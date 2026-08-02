import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getFedEvents, getProfileEventByName} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsAttendedPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const authToken = await getServerSideAuth()
    const [profileEvents, allRemote] = await Promise.all([
        getProfileEventByName({params: {name: currProfile.name}, clientMode: CLIENT_MODE}),
        // a failure here must not take down the page: remote events are extra
        getFedEvents({params: {authToken}, clientMode: CLIENT_MODE}).catch(() => [])
    ])
    const remoteEvents = allRemote.filter(e =>
        e.my_status === 'attending' || e.my_status === 'pending')

    const attends = setEventAttendedStatus({
        events: profileEvents.attends,
        currProfileAttends: profileEvents.attends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    return {
        currProfile,
        attends,
        remoteEvents
    }
}