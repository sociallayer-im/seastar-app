import {getGroupEventByHandle, Event, getProfileEventByHandle, setSdkConfig, ClientMode, Profile} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export const GroupEventListData = async function (handle: string, currProfile?: Profile | null) {
    const groupEvents = await getGroupEventByHandle(handle)

    let currProfileAttends:Event[] = []
    if (currProfile) {
        currProfileAttends = (await getProfileEventByHandle(currProfile.handle)).attends
    }

    return setEventAttendedStatus({
        events: groupEvents,
        currProfileAttends,
        currProfile
    })
}
