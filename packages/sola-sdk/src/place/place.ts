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
