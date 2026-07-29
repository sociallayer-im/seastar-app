import {ClientMode} from '../client'
import {request, requestOrNull} from '../request'
import {PopupCity, PopupCityDraft} from './types'
import {SolaSdkFunctionParams} from '../types'
import {Event} from '../event'
import {Group} from '../group'

// GET /discover payload
interface DiscoverPayload {
    groups: Group[]
    popup_cities: any[]
    events: Event[]
}

// A group (detail view) with popup-city fields → PopupCity.
const toPopupCity = (g: any): PopupCity => ({
    id: g.id,
    title: g.nickname || g.name,
    name: g.name,
    image_url: g.image_url ?? null,
    banner_image_url: g.banner_image_url ?? null,
    location: g.location ?? null,
    start_date: g.start_date ?? null,
    end_date: g.end_date ?? null,
    group_tags: g.group_tags ?? null,
    group_id: g.id,
    group: {id: g.id, name: g.name, nickname: g.nickname, image_url: g.image_url ?? null}
})

/** The homepage payload: featured groups, popup cities, upcoming events. */
export const discoverData = async ({clientMode}: { clientMode: ClientMode }) => {
    const data = await request<DiscoverPayload>('/discover', {clientMode, noCache: true})

    const popupCities = (data.popup_cities || []).map(toPopupCity)
    const featuredPopupCities = popupCities.filter(p =>
        p.group_tags?.includes('featured') || p.group_tags?.includes(':featured'))

    return {
        eventGroups: (data.groups || []) as Group[],
        popupCities,
        featuredPopupCities,
        events: (data.events || []) as Event[],
    }
}

export const getPopupCities = async ({clientMode}: { clientMode: ClientMode }) => {
    const data = await request<DiscoverPayload>('/discover', {clientMode, noCache: true})
    return (data.popup_cities || []).map(toPopupCity)
}

export const getPopupCityById = async ({params, clientMode}: SolaSdkFunctionParams<{ id: string }>) => {
    const group = await requestOrNull<any>(`/groups/${params.id}`, {clientMode, noCache: true})
    // Must match discover_controller.rb's popup-city criteria exactly (both
    // start_date AND location) — otherwise a group reachable here could never
    // appear in the discover/list views, or vice versa.
    if (!group || !group.start_date || !group.location) return null
    return toPopupCity(group)
}

/**
 * Marks an existing group as a popup city (sets its date range + location).
 * Requires manage rights on the group.
 */
export const createPopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{
    popupCityDraft: PopupCityDraft,
    authToken: string
}>) => {
    const {group_id, ...fields} = params.popupCityDraft
    await request(`/groups/${group_id}`, {
        method: 'PATCH',
        body: {group: fields},
        authToken: params.authToken,
        clientMode
    })
}

/** Updates a popup city's fields (id = group id). */
export const updatePopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{
    popupCity: PopupCity,
    authToken: string
}>) => {
    await request(`/groups/${params.popupCity.id}`, {
        method: 'PATCH',
        body: {
            group: {
                image_url: params.popupCity.image_url,
                location: params.popupCity.location,
                start_date: params.popupCity.start_date,
                end_date: params.popupCity.end_date,
            }
        },
        authToken: params.authToken,
        clientMode
    })
}

/**
 * Platform-admin curation: replace a popup city's group_tags (e.g. add/remove
 * "featured"/"top"). Privileged tags only pass through for platform admins
 * (users.permissions includes "admin") — the backend strips them otherwise.
 */
export const updatePopupCityGroupTags = async ({params, clientMode}: SolaSdkFunctionParams<{
    popupCity: PopupCity,
    authToken: string
}>) => {
    await request(`/groups/${params.popupCity.id}`, {
        method: 'PATCH',
        body: {group: {group_tags: params.popupCity.group_tags || []}},
        authToken: params.authToken,
        clientMode
    })
}

/** Platform-admin removal of a popup city (deletes the group). */
export const deletePopupCity = async ({params, clientMode}: SolaSdkFunctionParams<{
    popupCity: PopupCity,
    authToken: string
}>) => {
    await request(`/groups/${params.popupCity.id}`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode
    })
}
