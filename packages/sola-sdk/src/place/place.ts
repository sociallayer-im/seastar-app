import {request, requestOrNull, Paginated} from '../request'
import {SolaSdkFunctionParams} from '../types'
import {Place} from './types'

/**
 * Typeahead search over place name/address.
 */
export const searchPlace = async ({params: {query, authToken}, clientMode}: SolaSdkFunctionParams<{
    query: string
    authToken: string
}>): Promise<Place[]> => {
    return await request<Place[]>('/places/search', {
        params: {query},
        authToken,
        clientMode,
        noCache: true
    })
}

export const getPlaceById = async ({params: {id, authToken}, clientMode}: SolaSdkFunctionParams<{
    id: string
    authToken: string
}>): Promise<Place | null> => {
    return await requestOrNull<Place>(`/places/${id}`, {authToken, clientMode, noCache: true})
}

/**
 * Find-or-create by name: POSTing an existing name returns the existing
 * place (200) instead of erroring; a new name creates it (201).
 */
export const createPlace = async ({params, clientMode}: SolaSdkFunctionParams<{
    name: string
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    description?: string | null
    data?: Record<string, any> | null  // e.g. {google_place_id: '...'}
    authToken: string
}>): Promise<Place> => {
    const {authToken, ...place} = params
    return await request<Place>('/places', {
        method: 'POST',
        body: {place},
        authToken,
        clientMode,
        noCache: true
    })
}

// Flat location fields as they appear on event/venue/marker drafts.
export interface DraftLocationFields {
    location?: string | null
    formatted_address?: string | null
    geo_lat?: number | string | null
    geo_lng?: number | string | null
    location_data?: string | null  // Google Maps place_id
}

/**
 * The backend stores location on a `places` table and only accepts `place_id`
 * on event/venue/marker writes. Resolve a draft's flat location fields to a
 * place_id (find-or-create server side); null when no location is set.
 */
export const resolvePlaceId = async ({params, clientMode}: SolaSdkFunctionParams<DraftLocationFields & {
    authToken: string
}>): Promise<string | null> => {
    if (!params.location) return null
    const place = await createPlace({
        params: {
            name: params.location,
            address: params.formatted_address ?? null,
            latitude: params.geo_lat != null ? Number(params.geo_lat) : null,
            longitude: params.geo_lng != null ? Number(params.geo_lng) : null,
            data: params.location_data ? {google_place_id: params.location_data} : null,
            authToken: params.authToken,
        },
        clientMode,
    })
    return place.id
}
