import {getGqlClient, getSdkConfig} from '../client'
import {GET_MARKER_DETAIL_BY_ID, GET_MARKERS_BY_GROUP_HANDLE, GET_MARKERS_BY_GROUP_HANDLE_AND_CATEGORY} from './schemas'
import {Marker, MarkerDetail, MarkerDraft} from './types'

export const getMarkersByGroupHandle = async (groupHandle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_MARKERS_BY_GROUP_HANDLE,
        variables: {handle: groupHandle}
    })

    return response.data.markers as Marker[]
}

export const getMarkersByGroupHandleAndCategory = async (groupHandle: string, category: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_MARKERS_BY_GROUP_HANDLE_AND_CATEGORY,
        variables: {handle: groupHandle, category}
    })

    return response.data.markers as Marker[]
}

export const createMarker = async (marker: MarkerDraft, authToken: string) => {
    const props = {
        group_id: marker.group_id,
        auth_token: authToken,
        marker
    }

    const response = await fetch(`${getSdkConfig().api}/marker/create`, {
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

export const getMarkerById = async (markerId: number) => {
    const client = getGqlClient()
    const response = await client.mutate({
        mutation: GET_MARKER_DETAIL_BY_ID,
        variables: {id: markerId}
    })

    return response.data.markers[0] as MarkerDetail || null
}

export const updateMarker = async (markerDraft: MarkerDraft, authToken: string) => {
    const props = {
        auth_token: authToken,
        id: markerDraft.id,
        marker: markerDraft
    }

    const response = await fetch(`${getSdkConfig().api}/marker/update`, {
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

export const removeMarker = async (markerId: number, authToken: string) => {
    const response = await fetch(`${getSdkConfig().api}/marker/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: authToken,
            id: markerId
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