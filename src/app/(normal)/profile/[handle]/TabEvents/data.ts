import {
    getProfileEventByName,
    Profile,
} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {getServerSideAuth} from '@/app/actions'

export const ProfileEventListData = async function (handle: string, currProfile?: Profile | null) {
    const authToken = await getServerSideAuth()
    const profileEvents = await getProfileEventByName({
        params: {name: handle, authToken},
        clientMode: CLIENT_MODE
    })
    // The viewer's own attended/starred events, for the "you're going" /
    // "you starred this" badges on someone else's profile tabs.
    const currProfileAttends = currProfile
        ? (currProfile.name === handle
            ? profileEvents.attends
            : (await getProfileEventByName({params: {name: currProfile.name, authToken}, clientMode: CLIENT_MODE})).attends)
        : []

    const hosting = setEventAttendedStatus({
        events: profileEvents.hosting,
        currProfileAttends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    const attends = setEventAttendedStatus({
        events: profileEvents.attends,
        currProfileAttends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    const stared = setEventAttendedStatus({
        events: profileEvents.starred,
        currProfileAttends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    const coHosting = setEventAttendedStatus({
        events: profileEvents.coHosting,
        currProfileAttends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    return {
        hosting,
        attends,
        stared,
        coHosting
    }
}

