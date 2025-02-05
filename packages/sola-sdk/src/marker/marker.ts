import { getGqlClient } from '../client'
import {GET_MARKERS_BY_GROUP_HANDLE, GET_MARKERS_BY_GROUP_HANDLE_AND_CATEGORY} from './schemas'
import {Marker} from './types'

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