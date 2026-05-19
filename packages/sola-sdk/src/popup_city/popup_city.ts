import {ClientMode, getSdkConfig} from '../client'
import {Event, Group, getGroupEventByHandle} from '@sola/sdk'
import {PopupCity, PopupCityDraft} from './types'
import {SolaSdkFunctionParams} from '../types'

export const discoverData = async ({clientMode}: {clientMode: ClientMode}) => {
    const url = `${getSdkConfig(clientMode).api}/event/discover`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch:' + response.status + ' url: ' + url)
    }

    const data = await response.json()

    const popupCities = (data.popups || []) as PopupCity[]
    const featuredPopupCities = (data.featured_popups || []) as PopupCity[]

    const popupCityMap = await getGroupEventByHandle({params: {handle: 'popup2025'}, clientMode})

    return {
        eventGroups: data.groups as Group[],
        popupCities,
        featuredPopupCities,
        events: data.events as Event[],
        popupCityMap
    }
}

export const getPopupCities = async ({clientMode}: {clientMode: ClientMode}) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/popup_city/list`)
    const data = await resp.json()
    return (data.popup_cities || []) as PopupCity[]
}

export const getPopupCityById = async ({params, clientMode}: SolaSdkFunctionParams<{id: number}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/popup_city/get?id=${params.id}`)
    const data = await resp.json()
    return (data.popup_city as PopupCity) || null
}

// Creates popup-city info on an existing group (updates group fields directly)
export const createPopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{popupCityDraft: PopupCityDraft, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/create_popup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            auth_token: params.authToken,
            ...params.popupCityDraft
        })
    })

    if (!response.ok) {
        throw new Error('fail to create popup-city: ' + response.statusText)
    }
}

// Updates popup-city info on a group (id = group id)
export const updatePopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{popupCity: PopupCity, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/update_popup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            auth_token: params.authToken,
            id: params.popupCity.id,
            image_url: params.popupCity.image_url,
            location: params.popupCity.location,
            website: params.popupCity.website,
            start_date: params.popupCity.start_date,
            end_date: params.popupCity.end_date,
        })
    })

    if (!response.ok) {
        const data = await response.json()
        throw new Error('fail to update popup-city: ' + (data.message || response.statusText))
    }
}

// Updates group_tags on a group (id = group id)
export const updatePopupCityGroupTags = async ({params, clientMode}: SolaSdkFunctionParams<{popupCity: PopupCity, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/update_popup_admin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            auth_token: params.authToken,
            id: params.popupCity.id,
            group_tags: params.popupCity.group_tags,
        })
    })

    if (!response.ok) {
        throw new Error('fail to update popup-city group tags: ' + response.statusText)
    }
}

// Clears popup-city fields on a group (start_date/end_date → null, removes popup tags)
export const deletePopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{popupCity: PopupCity, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/group/delete_popup_admin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            auth_token: params.authToken,
            id: params.popupCity.id,
        })
    })

    if (!response.ok) {
        throw new Error('fail to delete popup-city: ' + response.statusText)
    }
}
