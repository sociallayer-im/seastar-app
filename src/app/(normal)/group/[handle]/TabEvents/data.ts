import {getGroupEventByHandle, Event, getProfileEventByHandle, ClientMode, Profile} from '@sola/sdk'
import {analyzeGroupMembershipAndCheckProfilePermissions, setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'


export const GroupEventListData = async function (handle: string, currProfile?: Profile | null) {
    const groupEvents = await getGroupEventByHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })

    let currProfileAttends: Event[] = []
    let currProfileStarred: Event[] = []
    if (currProfile) {
        const {attends, starred}  = await getProfileEventByHandle({
            params: {handle: handle},
            clientMode: CLIENT_MODE
        })
        currProfileAttends = attends
        currProfileStarred = starred
    }

    return setEventAttendedStatus({
        events: groupEvents,
        currProfileAttends,
        currProfileStarred,
        currProfile
    })
}
