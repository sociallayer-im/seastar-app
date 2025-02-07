import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'
import {getProfileEventByHandle} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default async function MyEventsCohostingPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const profileEvents = await getProfileEventByHandle({
        params: {handle: currProfile.handle},
        clientMode: CLIENT_MODE
    })

    const coHosting = setEventAttendedStatus({
        events: profileEvents.coHosting,
        currProfileAttends: profileEvents.attends,
        currProfile
    })

    return {
        currProfile,
        coHosting
    }
}