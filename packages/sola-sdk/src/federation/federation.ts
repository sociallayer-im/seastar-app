import {request} from '../request'
import {SolaSdkFunctionParams} from '../types'
import {ClientMode} from '../client'
import {FedActor, FedAliases, FedDomainStatus, FedEvent, FedFollowing} from './types'

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

// --- custom domain (group settings) ------------------------------------------

export const getGroupFedDomain = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    authToken: string
}>) => {
    return await request<FedDomainStatus>(`/federation/groups/${encodeURIComponent(params.groupId)}/domain`, {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/**
 * Step 1: claim a domain. Returns the TXT record to publish — nothing is bound
 * until verifyGroupFedDomain succeeds, so this is safe to call speculatively.
 * Re-claiming the same domain returns the same challenge.
 */
export const claimGroupFedDomain = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    domain: string
    authToken: string
}>) => {
    return await request<FedDomainStatus>(`/federation/groups/${encodeURIComponent(params.groupId)}/domain`, {
        method: 'POST',
        body: {domain: params.domain},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/** Step 2: check the TXT record and bind. 422 while DNS has not propagated. */
export const verifyGroupFedDomain = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    authToken: string
}>) => {
    return await request<FedDomainStatus>(`/federation/groups/${encodeURIComponent(params.groupId)}/domain/verify`, {
        method: 'POST',
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const unbindGroupFedDomain = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    authToken: string
}>) => {
    return await request<FedDomainStatus>(`/federation/groups/${encodeURIComponent(params.groupId)}/domain`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

// --- aliases and migration ---------------------------------------------------

export const getGroupFedAliases = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    authToken: string
}>) => {
    return await request<FedAliases>(`/federation/groups/${encodeURIComponent(params.groupId)}/aliases`, {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/**
 * Declare a former identity. This is the *receiving* half of a migration: the
 * old actor's Move is only honoured by peers if the new actor independently
 * claims it here.
 */
export const addGroupFedAlias = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    uri: string
    authToken: string
}>) => {
    return await request<FedAliases>(`/federation/groups/${encodeURIComponent(params.groupId)}/aliases`, {
        method: 'POST',
        body: {uri: params.uri},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const removeGroupFedAlias = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    uri: string
    authToken: string
}>) => {
    return await request<FedAliases>(
        `/federation/groups/${encodeURIComponent(params.groupId)}/aliases?uri=${encodeURIComponent(params.uri)}`, {
            method: 'DELETE',
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
}

/**
 * Announce the move. Fails with 422 unless the target actor already lists this
 * group in its alsoKnownAs — mutual attestation is what stops a hijack, so the
 * destination has to be prepared first.
 */
export const moveGroupFedActor = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string
    target: string
    authToken: string
}>) => {
    return await request<{moved_to: string}>(`/federation/groups/${encodeURIComponent(params.groupId)}/move`, {
        method: 'POST',
        body: {target: params.target},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

// --- the signed-in user's own aliases ----------------------------------------

export const getMyFedAliases = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    return await request<FedAliases>('/federation/profile/aliases', {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const addMyFedAlias = async ({params, clientMode}: SolaSdkFunctionParams<{
    uri: string
    authToken: string
}>) => {
    return await request<FedAliases>('/federation/profile/aliases', {
        method: 'POST',
        body: {uri: params.uri},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const removeMyFedAlias = async ({params, clientMode}: SolaSdkFunctionParams<{
    uri: string
    authToken: string
}>) => {
    return await request<FedAliases>(`/federation/profile/aliases?uri=${encodeURIComponent(params.uri)}`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}
