import {SolaSdkFunctionParams} from '../types'
import {GET_TRACK_DETAIL_BY_ID, GET_TRACK_ROLE_BY_TRACK_ID, GET_TRACK_ROLES_BY_TRACK_IDS} from './schemas'
import {getGqlClient, getSdkConfig} from '../client'
import {Profile} from '../profile'
import {Track, TrackDetail, TrackRole} from './types'

export const removeTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    trackId: number,
    authToken: string
}>) => {
    const props = {
        auth_token: params.authToken,
        track_id: params.trackId,
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/group/remove_track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to remove track')
    }
}

export const getTrackDetailById = async ({params, clientMode}: SolaSdkFunctionParams<{ trackId: number }>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_TRACK_DETAIL_BY_ID,
        variables: {id: params.trackId}
    })

    return response.data.tracks[0] as TrackDetail || null
}

export const getTrackRoleByTrackId = async ({params, clientMode}: SolaSdkFunctionParams<{ trackId: number }>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_TRACK_ROLE_BY_TRACK_ID,
        variables: {trackId: params.trackId}
    })

    return response.data.track_roles as TrackRole[] || []
}

export const addTrackRole = async ({params, clientMode}: SolaSdkFunctionParams<{
    group_id: number,
    track_id: number,
    profile_id: number,
    authToken: string,
    role?: 'manager' | 'member'
}>) => {
    const props = {
        track_id: params.track_id,
        auth_token: params.authToken,
        track_role: {
            group_id: params.group_id,
            track_id: params.track_id,
            profile_id: params.profile_id,
            receiver_address: null,
            role: params.role || 'manager',
        }
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/group/add_track_role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to update')
    }

    const data = await res.json()

    return data.track_role as TrackRole
    
}

export const removeTrackRole = async ({params, clientMode}: SolaSdkFunctionParams<{
    trackId: number,
    profileId: number,
    authToken: string
}>) => {
    const props = {
        auth_token: params.authToken,
        track_id: params.trackId,
        profile_id: params.profileId,
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/group/remove_track_role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to remove track role')
    }
}

export const updateTrackV2 = async ({params, clientMode}: SolaSdkFunctionParams<{
    track: Track,
    authToken: string
    addManagerIds?: number[],
    removeManagerIds?: number[],
    addMemberIds?: number[],
    removeMemberIds?: number[],
}>) => {

    const props = {
        auth_token: params.authToken,
        track_id: params.track.id,
        track: params.track
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/group/update_track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to update')
    }

    const data = await res.json()

    if(params.addManagerIds?.length) {
        const addRolesTasks = params.addManagerIds.map(m => addTrackRole({params: {
            group_id: params.track.group_id,
            track_id: params.track.id,
            profile_id: m,
            authToken: params.authToken,
            role: 'manager'
        }, clientMode}))
        await Promise.all(addRolesTasks)
    }

    if(params.removeManagerIds?.length) {
        const removeRolesTasks = params.removeManagerIds.map(r => removeTrackRole({params: {
            trackId: params.track.id,
            profileId: r,
            authToken: params.authToken
        }, clientMode}))
        await Promise.all(removeRolesTasks)
    }

    if(params.addMemberIds?.length) {
        const addRolesTasks = params.addMemberIds.map(m => addTrackRole({params: {
            group_id: params.track.group_id,
            track_id: params.track.id,
            profile_id: m,
            authToken: params.authToken,
            role: 'member'
        }, clientMode}))
        await Promise.all(addRolesTasks)
    }

    if(params.removeMemberIds?.length) {
        const removeRolesTasks = params.removeMemberIds.map(r => removeTrackRole({params: {
            trackId: params.track.id,
            profileId: r,
            authToken: params.authToken
        }, clientMode}))
        await Promise.all(removeRolesTasks)
    }

    return data.track as Track
}


export const updateTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    track: Track,
    authToken: string
    managers?: Profile[],
}>) => {

    let newTrackRoles: TrackRole[] = []
    if (params.managers) {
        const trackRoles = await getTrackRoleByTrackId({params: {trackId: params.track.id}, clientMode})
        const removedManagers = trackRoles.map(r => {
            return {
                ...r,
                _destroy: '1'
            }
        })
        const newManagers = params.managers.map(m => {
            return {
                group_id: params.track.group_id,
                track_id: params.track.id,
                profile_id: m.id,
                receiver_address: null,
                role: 'manager',
            } as TrackRole
        })

        newTrackRoles = [...removedManagers, ...newManagers]
    }

    const props = {
        auth_token: params.authToken,
        track_id: params.track.id,
        track: {
            ...params.track,
            track_roles_attributes: newTrackRoles.length ? newTrackRoles : undefined,
            manager_ids: newTrackRoles.length ? newTrackRoles.map(r => r.profile_id) : null
        }
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/group/update_track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to update')
    }

    const data = await res.json()

    return data.track as Track
}

export const createTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    track: Track,
    authToken: string
    managers?: Profile[],
    members?: Profile[],
}>) => {

   
    const props = {
        auth_token: params.authToken,
        group_id: params.track.group_id,
        track: params.track,
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/group/add_track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to create track')
    }

    const data = await res.json()

    const newTrack = data.track as Track

    if(params.managers?.length) {
        const addRolesTasks = params.managers.map(m => addTrackRole({params: {
            group_id: params.track.group_id,
            track_id: newTrack.id,
            profile_id: m.id,
            authToken: params.authToken,
            role: 'manager'
        }, clientMode}))
        await Promise.all(addRolesTasks)
    }

    if(params.members?.length) {
        const addRolesTasks = params.members.map(m => addTrackRole({params: {
            group_id: params.track.group_id,
            track_id: newTrack.id,
            profile_id: m.id,
            authToken: params.authToken,
            role: 'member'
        }, clientMode}))
        await Promise.all(addRolesTasks)
    }

    return newTrack
}

export const getTrackRolesByTrackIds = async ({params, clientMode}: SolaSdkFunctionParams<{
    trackIds: number[],
}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_TRACK_ROLES_BY_TRACK_IDS,
        variables: {trackIds: params.trackIds}
    })

    return response.data.track_roles as TrackRole[] || []
}
