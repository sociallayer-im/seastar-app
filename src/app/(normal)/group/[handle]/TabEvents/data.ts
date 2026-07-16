import {getGroupEventByName, Event, getProfileEventByName, Profile} from '@sola/sdk'
import {setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'


export const GroupEventListData = async function (handle: string, currProfile?: Profile | null) {
    const groupEvents = await getGroupEventByName({
        params: {name: handle},
        clientMode: CLIENT_MODE
    })

    let currProfileAttends: Event[] = []
    let currProfileStarred: Event[] = []
    if (currProfile) {
        const {attends, starred}  = await getProfileEventByName({
            params: {name: currProfile.name},
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
