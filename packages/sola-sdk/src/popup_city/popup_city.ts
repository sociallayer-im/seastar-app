import {ClientMode, getGqlClient, getSdkConfig} from '../client'
import {Event, Group, getGroupDetailById, GroupDetail, getGroupEventByHandle, PopupCityDraft} from '@sola/sdk'
import {PopupCity} from './types'
import {GET_POPUP_CITIES, GET_POPUP_CITIES_BY_ID} from './schemas'
import {SolaSdkFunctionParams} from '../types'

export const discoverData = async ({clientMode}: {clientMode: ClientMode}) => {
    const url = `${getSdkConfig(clientMode).api}/event/discover`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch:' + response.status + ' url: ' + url)
    }

    const data = await response.json()

    const sortedPopupCities = data.popups.sort((a: PopupCity, b: PopupCity) => {
        // if a popup city has ":featured" tag, it should be placed at the top
        if (a.group_tags?.includes(':featured')) {
            return -1
        }
    })

    const popupCityMap = await getGroupEventByHandle({params: {handle: 'popup2025'}, clientMode})

    return {
        eventGroups: data.groups as Group[],
        popupCities: sortedPopupCities as PopupCity[],
        events: data.events as Event[],
        popupCityMap
    }
}

export const getPopupCities = async ({clientMode}: {clientMode: ClientMode}) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_POPUP_CITIES
    })

    return response.data.popup_cities as PopupCity[]
}

export const createPopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{popupCityDraft: PopupCityDraft, authToken: string}>) => {
    const props = {
        auth_token: params.authToken,
        ...params.popupCityDraft
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/group/create_popup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!response.ok) {
        throw new Error('fail to create popup-city: ' + response.statusText)
    }
}

export const getPopupCityById = async ({params, clientMode}: SolaSdkFunctionParams<{id: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_POPUP_CITIES_BY_ID,
        variables: params
    })

    return response.data.popup_cities[0] as PopupCity || null
}

export const updatePopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{popupCity: PopupCity, authToken: string}>) => {
    const props = {
        auth_token: params.authToken,
        ...params.popupCity
    }

    const response = await fetch(`${getSdkConfig(clientMode).api}/group/update_popup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!response.ok) {
        const data = await response.json()
        throw new Error('fail to update popup-city: ' + (data.message || response.statusText))
    }
}