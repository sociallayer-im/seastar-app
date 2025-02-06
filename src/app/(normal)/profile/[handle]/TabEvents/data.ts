import {cookies} from 'next/headers'
import {
    getProfileEventByHandle,
    setSdkConfig,
    ClientMode,
    getStaredEvent,
    Profile,
    getMyPendingApprovalEvent
} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export const ProfileEventListData = async function (handle: string, currProfile?: Profile | null) {
    const profileEvents = await getProfileEventByHandle(handle)
    const isSelf = currProfile?.handle === handle

    const [currProfileAttends, staredEvents] = await Promise.all([
        currProfile ? (await getProfileEventByHandle(currProfile.handle)).attends : [],
        (async () => {
            if (isSelf) {
                const auth_token = cookies().get(process.env.NEXT_PUBLIC_AUTH_FIELD!)?.value
                if (auth_token) {
                    return await getStaredEvent(auth_token)
                }
            }
            return []
        })()
    ])

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

