import {getGroupEventByHandle, Event, getProfileEventByHandle, ClientMode, Profile} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'


export const GroupEventListData = async function (handle: string, currProfile?: Profile | null) {
    const groupEvents = await getGroupEventByHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })

    let currProfileAttends: Event[] = []
    if (currProfile) {
        currProfileAttends = (await getProfileEventByHandle({
            params: {handle: handle},
            clientMode: CLIENT_MODE
        })).attends
    }

    return setEventAttendedStatus({
        events: groupEvents,
        currProfileAttends,
        currProfile
    })
}
