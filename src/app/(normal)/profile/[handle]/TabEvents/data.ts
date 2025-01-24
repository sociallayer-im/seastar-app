import {cookies} from 'next/headers'
import {getProfileEventByHandle, setSdkConfig, Event, ClientMode, getStaredEvent, Profile} from '@sola/sdk'
import {EventWithJoinStatus, setEventAttendedStatus} from '@/utils'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export const ProfileEventListData = async function (handle: string, currProfile?: Profile | null) {
    const profileEvents = await getProfileEventByHandle(handle)

    let currProfileAttends: Event[] = []
    if (!!currProfile) {
        currProfileAttends = (await getProfileEventByHandle(currProfile.handle)).attends
    }

    let staredEvents: Event[] = []
    if (currProfile?.handle === handle) {
        const auth_token = cookies().get(process.env.NEXT_PUBLIC_AUTH_FIELD!)?.value
        if (auth_token) {
            staredEvents = await getStaredEvent(auth_token)
        }
    }

    const hosting = setEventAttendedStatus({
        events: profileEvents.hosting,
        currProfileAttends,
        currProfile
    })

    const attends = setEventAttendedStatus({
        events: profileEvents.attends,
        currProfileAttends,
        currProfile
    })

    const stared = setEventAttendedStatus({
        events: staredEvents,
        currProfileAttends,
        currProfile
    })

    const coHosting = setEventAttendedStatus({
        events: profileEvents.coHosting,
        currProfileAttends,
        currProfile
    })

    return {
        hosting,
        attends,
        stared,
        coHosting
    }
}

