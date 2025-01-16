import {gql, request} from 'graphql-request'
import {cookies} from 'next/headers'
import {getProfileEventByHandle, setSdkConfig, Event, ClientMode, getStaredEvent} from '@sola/sdk'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export interface EventWithJoinStatus extends Event {
    isCreator: boolean
    isJoined: boolean
}

export const ProfileEventListData = async function (handle: string, currUserHandle?: string) {
    const profileEvents = await getProfileEventByHandle(handle)

    let currUserAttended: Event[] = []
    if (currUserHandle) {
        currUserAttended = await (await getProfileEventByHandle(handle)).attends
    }

    let staredEvents: Event[] = []
    if (currUserHandle === handle) {
        const auth_token = cookies().get(process.env.NEXT_PUBLIC_AUTH_FIELD!)?.value
        if (auth_token) {
            staredEvents = await getStaredEvent(auth_token)
        }
    }

    const hosting = profileEvents.hosting.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!currUserAttended.find(h => h.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as EventWithJoinStatus
    })

    const attends = profileEvents.attends.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!currUserAttended.find(h => h.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as EventWithJoinStatus
    })

    const stared = staredEvents.map(e => {
        const isCreator = e.owner.handle === currUserHandle
        const isJoined = !!currUserAttended.find(h => h.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as EventWithJoinStatus
    })

    return {
        hosting,
        attends,
        stared
    }
}

