import {getSdkConfig} from '../client'
import {SolaSdkFunctionParams} from '../types'
import {Place} from './types'

export const searchPlace = async ({params: {query}, clientMode}: SolaSdkFunctionParams<{
    query: string
}>): Promise<Place[]> => {
    const url = `${getSdkConfig(clientMode).api}/place/search?query=${encodeURIComponent(query)}`
    const res = await fetch(url, {cache: 'no-store'})
    const data = await res.json()
    return data.places as Place[]
}

export const getPlaceById = async ({params: {id}, clientMode}: SolaSdkFunctionParams<{
    id: number
}>): Promise<Place | null> => {
    const url = `${getSdkConfig(clientMode).api}/place/get?id=${id}`
    const res = await fetch(url, {cache: 'no-store'})
    if (!res.ok) return null
    const data = await res.json()
    return data.place as Place
}

export const createPlace = async ({params, clientMode}: SolaSdkFunctionParams<{
    name: string
    address?: string | null
    geo_lat?: number | null
    geo_lng?: number | null
    location_viewport?: string | null
    data?: string | null  // Google Maps place_id
    authToken: string
}>): Promise<Place> => {
    const {authToken, ...body} = params
    const url = `${getSdkConfig(clientMode).api}/place/create`
    const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...body, auth_token: authToken}),
        cache: 'no-store',
    })
    const data = await res.json()
    return data.place as Place
}

// Flat location fields as they appear on event/venue/marker drafts.
export interface DraftLocationFields {
    location?: string | null
    formatted_address?: string | null
    geo_lat?: number | string | null
    geo_lng?: number | string | null
    location_viewport?: string | null
    location_data?: string | null  // Google Maps place_id
}

// The backend stores location on a `places` table and only accepts `place_id`
// on event/venue/marker writes. Resolve a draft's flat location fields to a
// place_id (find-or-create server side); null when no location is set.
export const resolvePlaceId = async ({params, clientMode}: SolaSdkFunctionParams<DraftLocationFields & {
    authToken: string
}>): Promise<number | null> => {
    if (!params.location) return null
    const place = await createPlace({
        params: {
            name: params.location,
            address: params.formatted_address ?? null,
            geo_lat: params.geo_lat != null ? Number(params.geo_lat) : null,
            geo_lng: params.geo_lng != null ? Number(params.geo_lng) : null,
            location_viewport: params.location_viewport ?? null,
            data: params.location_data ?? null,
            authToken: params.authToken,
        },
        clientMode,
    })
    return place.id
}
