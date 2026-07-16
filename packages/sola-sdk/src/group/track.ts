import {SolaSdkFunctionParams} from '../types'
import {request, requestOrNull} from '../request'
import {Track, TrackDetail} from './types'

/**
 * Get track detail (public, includes track_roles)
 */
export const getTrackDetailById = async ({params, clientMode}: SolaSdkFunctionParams<{trackId: string}>) => {
    return await requestOrNull<TrackDetail>(`/tracks/${encodeURIComponent(params.trackId)}`, {clientMode})
}

/**
 * Create a track — group manager only. Managers are synced via manager_ids.
 */
export const createTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    track: Partial<Track> & {group_id?: string},
    managerIds?: string[],
    authToken: string
}>) => {
    return await request<TrackDetail>('/tracks', {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {
            track: {
                group_id: params.track.group_id,
                title: params.track.title,
                description: params.track.description,
                image_url: params.track.image_url,
                is_private: params.track.is_private,
                start_date: params.track.start_date,
                end_date: params.track.end_date,
                ...(params.managerIds ? {manager_ids: params.managerIds} : {})
            }
        }
    })
}

/**
 * Update a track — group manager only. Passing managerIds replaces the
 * track's manager roles; omitting it leaves them untouched.
 */
export const updateTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    track: Partial<Track> & {id: string},
    managerIds?: string[],
    authToken: string
}>) => {
    return await request<TrackDetail>(`/tracks/${params.track.id}`, {
        method: 'PATCH',
        clientMode,
        authToken: params.authToken,
        body: {
            track: {
                title: params.track.title,
                description: params.track.description,
                image_url: params.track.image_url,
                is_private: params.track.is_private,
                start_date: params.track.start_date,
                end_date: params.track.end_date,
                ...(params.managerIds ? {manager_ids: params.managerIds} : {})
            }
        }
    })
}

export const removeTrack = async ({params, clientMode}: SolaSdkFunctionParams<{
    trackId: string,
    authToken: string
}>) => {
    await request(`/tracks/${params.trackId}`, {
        method: 'DELETE',
        clientMode,
        authToken: params.authToken
    })
}
