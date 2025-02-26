import {
    getProfileEventByHandle,
    getStaredEvent,
    Profile,
} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {getServerSideAuth} from '@/app/actions'

export const ProfileEventListData = async function (handle: string, currProfile?: Profile | null) {
    const profileEvents = await getProfileEventByHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })
    const isSelf = currProfile?.handle === handle

    const [currProfileAttends, staredEvents] = await Promise.all([
        currProfile ? (await getProfileEventByHandle({
            params: {handle: handle},
            clientMode: CLIENT_MODE
        })).attends : [],
        (async () => {
            if (isSelf) {
                const authToken = await getServerSideAuth()
                if (authToken) {
                    return await getStaredEvent({
                        params: {authToken: authToken},
                        clientMode: CLIENT_MODE
                    })
                }
            }
            return []
        })()
    ])

    const hosting = setEventAttendedStatus({
        events: profileEvents.hosting,
        currProfileAttends,
        currProfileStarred: staredEvents,
        currProfile
    })

    const attends = setEventAttendedStatus({
        events: profileEvents.attends,
        currProfileAttends,
        currProfileStarred: staredEvents,
        currProfile
    })

    const stared = setEventAttendedStatus({
        events: staredEvents,
        currProfileAttends,
        currProfileStarred: staredEvents,
        currProfile
    })

    const coHosting = setEventAttendedStatus({
        events: profileEvents.coHosting,
        currProfileAttends,
        currProfileStarred: staredEvents,
        currProfile
    })

    return {
        hosting,
        attends,
        stared,
        coHosting
    }
}

