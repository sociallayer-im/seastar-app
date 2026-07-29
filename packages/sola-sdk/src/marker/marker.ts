import {Marker, MarkerDetail, MarkerDraft} from './types'
import {SolaSdkFunctionParams} from '../types'
import {request, requestOrNull, Paginated} from '../request'
import {resolvePlaceId} from '../place'

/**
 * Markers of a group (map page). group accepts a TSID or the group slug.
 */
export const getMarkersByGroupName = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupName: string,
    category?: string,
    authToken?: string
}>) => {
    try {
        const res = await request<Paginated<Marker>>('/markers', {
            params: {group_id: params.groupName, category: params.category, limit: 100},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
        return res.data
    } catch {
        return [] as Marker[]
    }
}

export const getMarkerById = async ({params, clientMode}: SolaSdkFunctionParams<{
    markerId: string,
    authToken?: string
}>) => {
    return await requestOrNull<MarkerDetail>(`/markers/${params.markerId}`, {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

const markerBody = (draft: MarkerDraft, placeId: string | null) => ({
    place_id: placeId,
    category: draft.category,
    pin_image_url: draft.pin_image_url,
    cover_image_url: draft.cover_image_url,
    title: draft.title,
    about: draft.about,
    link: draft.link,
    status: draft.status,
    data: draft.data
})

export const createMarker = async ({params, clientMode}: SolaSdkFunctionParams<{
    marker: MarkerDraft,
    authToken: string
}>) => {
    const placeId = await resolvePlaceId({params: {...params.marker, authToken: params.authToken}, clientMode})
    if (!placeId) {
        throw new Error('A marker requires a location')
    }

    return await request<Marker>('/markers', {
        method: 'POST',
        body: {marker: {...markerBody(params.marker, placeId), group_id: params.marker.group_id}},
        authToken: params.authToken,
        clientMode
    })
}

export const updateMarker = async ({params, clientMode}: SolaSdkFunctionParams<{
    markerDraft: MarkerDraft,
    authToken: string
}>) => {
    if (!params.markerDraft.id) {
        throw new Error('markerDraft.id is required')
    }
    const placeId = await resolvePlaceId({params: {...params.markerDraft, authToken: params.authToken}, clientMode})
    if (!placeId) {
        throw new Error('A marker requires a location')
    }

    return await request<Marker>(`/markers/${params.markerDraft.id}`, {
        method: 'PATCH',
        body: {marker: markerBody(params.markerDraft, placeId)},
        authToken: params.authToken,
        clientMode
    })
}

export const removeMarker = async ({params, clientMode}: SolaSdkFunctionParams<{
    markerId: string,
    authToken: string
}>) => {
    await request(`/markers/${params.markerId}`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode
    })
}
