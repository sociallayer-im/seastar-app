import {getGqlClient, getSdkConfig} from '../client'
import {GET_MARKER_DETAIL_BY_ID, GET_MARKERS_BY_GROUP_HANDLE, GET_MARKERS_BY_GROUP_HANDLE_AND_CATEGORY} from './schemas'
import {Marker, MarkerDetail, MarkerDraft} from './types'
import {SolaSdkFunctionParams} from '../types'

export const getMarkersByGroupHandle = async ({params, clientMode}:SolaSdkFunctionParams<{groupHandle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_MARKERS_BY_GROUP_HANDLE,
        variables: {handle: params.groupHandle}
    })

    return response.data.markers as Marker[]
}

export const getMarkersByGroupHandleAndCategory = async ({params, clientMode}:SolaSdkFunctionParams<{groupHandle: string, category: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_MARKERS_BY_GROUP_HANDLE_AND_CATEGORY,
        variables: {handle: params.groupHandle, category: params.category}
    })

    return response.data.markers as Marker[]
}

export const createMarker = async ({params, clientMode}:SolaSdkFunctionParams<{marker: MarkerDraft, authToken: string}>) => {
    const props = {
        group_id: params.marker.group_id,
        auth_token: params.authToken,
        marker: params.marker
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/marker/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!response.ok) {
        throw new Error('create failed')
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }

    return data.marker as Marker
}

export const getMarkerById = async ({params, clientMode}:SolaSdkFunctionParams<{markerId: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.mutate({
        mutation: GET_MARKER_DETAIL_BY_ID,
        variables: {id: params.markerId}
    })

    return response.data.markers[0] as MarkerDetail || null
}

export const updateMarker = async ({params, clientMode}: SolaSdkFunctionParams<{markerDraft: MarkerDraft, authToken: string}>) => {
    const props = {
        auth_token: params.authToken,
        id: params.markerDraft.id,
        marker: params.markerDraft
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/marker/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }

    return data.marker as Marker
}

export const removeMarker = async ({params, clientMode}:SolaSdkFunctionParams<{markerId: number, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/marker/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: params.authToken,
            id: params.markerId
        })
    })

    if (!response.ok) {
        throw new Error('Remove failed')
    }

    const data = await response.json()

    if (data.result === 'error') {
        throw new Error(data.message)
    }
}