import {request} from '../request'
import {SolaSdkFunctionParams} from '../types'
import {ClientMode} from '../client'
import {FedActor, FedEvent, FedFollowing} from './types'

/**
 * Look up an account on another instance. Accepts what a person would type
 * (`@name@host` or `name@host`) or a raw ActivityPub id.
 *
 * Resolution is a network round trip to the other server, so it is a POST —
 * it has a side effect over there (and caches the actor here).
 */
export const resolveFedActor = async ({params, clientMode}: SolaSdkFunctionParams<{
    acct?: string
    uri?: string
    authToken: string
}>) => {
    return await request<FedActor>('/federation/resolve', {
        method: 'POST',
        body: {acct: params.acct, uri: params.uri},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const followFedActor = async ({params, clientMode}: SolaSdkFunctionParams<{
    uri: string
    authToken: string
}>) => {
    return await request<{state: string} & FedActor>('/federation/follow', {
        method: 'POST',
        body: {uri: params.uri},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const unfollowFedActor = async ({params, clientMode}: SolaSdkFunctionParams<{
    uri: string
    authToken: string
}>) => {
    await request('/federation/follow', {
        method: 'DELETE',
        params: {uri: params.uri},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const getFedFollowing = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    return await request<FedFollowing[]>('/federation/following', {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/** Events mirrored from instances we follow. Public — no token needed. */
export const getFedEvents = async ({params, clientMode}: {
    params?: {authToken?: string},
    clientMode: ClientMode
}) => {
    return await request<FedEvent[]>('/federation/events', {
        authToken: params?.authToken,
        clientMode,
        noCache: true
    })
}

export const getFedEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string
    authToken?: string
}>) => {
    return await request<FedEvent>(`/federation/events/${params.eventId}`, {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/**
 * Ask the origin instance to let this user in. It comes back `pending`: only
 * that instance can approve, and it says so with an Accept we process later —
 * so the UI must not claim the user is going yet.
 */
export const joinFedEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string
    message?: string
    authToken: string
}>) => {
    return await request<{status: string, event: FedEvent}>(
        `/federation/events/${params.eventId}/join`, {
            method: 'POST',
            body: {message: params.message},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
}

export const leaveFedEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string
    authToken: string
}>) => {
    await request(`/federation/events/${params.eventId}/join`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}
