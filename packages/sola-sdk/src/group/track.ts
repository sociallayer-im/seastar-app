import {SolaSdkFunctionParams} from '../types'
import {GET_TRACK_DETAIL_BY_ID, GET_TRACK_ROLE_BY_TRACK_ID} from './schemas'
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
        track: {
            _destroy: '1'
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
        throw new Error('Failed to send feedback')
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
        throw new Error('Failed to send feedback')
    }

    const data = await res.json()

    return data.track as Track
}

export const createTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    track: Track,
    authToken: string
    managers?: Profile[],
}>) => {

    const newTrackRoles = params.managers?.map(m => {
        return {
            group_id: params.track.group_id,
            track_id: params.track.id,
            profile_id: m.id,
            receiver_address: null,
            role: 'manager',
        } as TrackRole
    })

    const props = {
        auth_token: params.authToken,
        track: {
            ...params.track,
            track_roles_attributes: newTrackRoles?.length ? newTrackRoles : undefined,
            manager_ids: newTrackRoles?.length ? newTrackRoles.map(r => r.profile_id) : null
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
        throw new Error('Failed to send feedback')
    }

    const data = await res.json()

    return data.track as Track
}