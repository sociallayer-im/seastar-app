import {getGroupEventByHandle, Event, getProfileEventByHandle, setSdkConfig, ClientMode} from '@sola/sdk'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export const GroupEventListData = async function (handle: string, currUserHandle?: string) {
    const groupEvents = await getGroupEventByHandle(handle)

    let currUserAttendEvents:Event[] = []
    if (currUserHandle) {
        currUserAttendEvents = (await getProfileEventByHandle(currUserHandle)).attends
    }

    return groupEvents.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!currUserAttendEvents.find(j => j.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as any
    })

}
