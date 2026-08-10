import {ClientMode} from '../client'
import {request} from '../request'
import {PopupCity, PopupCityDraft} from './types'
import {SolaSdkFunctionParams} from '../types'
import {Event} from '../event'
import {Community, Group} from '../group'

// GET /discover payload
interface DiscoverPayload {
    groups: Group[]
    /** Every active group, tagged or not — the homepage's community list. */
    communities: Community[]
    popup_cities: any[]
    events: Event[]
}

// A group (detail view) with popup-city fields → PopupCity.
// image_url prefers featured_image_url — a wide/banner-style image meant
// for exactly this card, distinct from the group's small avatar image_url —
// falling back to the avatar only when no featured image is set. Matches
// sails' `group.featured_image_url || group.image_url` (event/discover).
const toPopupCity = (g: any): PopupCity => ({
    id: g.id,
    title: g.nickname || g.name,
    name: g.name,
    image_url: g.featured_image_url || g.image_url || null,
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
        // eventGroups is the CURATED slice (featured/top tagged); communities
        // is every active group. They answer different questions, so a plain
        // untagged group appears only in the second.
        eventGroups: (data.groups || []) as Group[],
        communities: (data.communities || []) as Community[],
        popupCities,
        featuredPopupCities,
        events: (data.events || []) as Event[],
    }
}

export const getPopupCities = async ({clientMode}: { clientMode: ClientMode }) => {
    const data = await request<DiscoverPayload>('/discover', {clientMode, noCache: true})
    return (data.popup_cities || []).map(toPopupCity)
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

/**
 * Platform-admin curation: replace a popup city's group_tags (e.g. add/remove
 * "featured"/"top"). Privileged tags only pass through for platform admins
 * (users.admin, or the older users.permissions containing "admin") — the
 * backend strips them otherwise.
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
