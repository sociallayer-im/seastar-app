import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getProfileEventByName} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsCohostingPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByName({
        params: {name: currProfile.name},
        clientMode: CLIENT_MODE
    })

    const coHosting = setEventAttendedStatus({
        events: profileEvents.coHosting,
        currProfileAttends: profileEvents.attends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    return {
        currProfile,
        coHosting
    }
}