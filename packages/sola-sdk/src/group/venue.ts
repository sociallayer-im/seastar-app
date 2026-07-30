import {SolaSdkFunctionParams} from '../types'
import {request, requestOrNull} from '../request'
import {VenueAvailability, VenueDetail} from './types'
import {resolvePlaceId} from '../place'

/**
 * Venue detail. The endpoint is public, so the token is optional — pass it
 * when a signed-in user is viewing (server-side: getServerSideAuth()), both so
 * the request is attributed and so Next doesn't serve them a cached anonymous
 * response.
 */
export const getVenueDetailById = async function ({params: {venueId, authToken}, clientMode}: SolaSdkFunctionParams<{
    venueId: string,
    authToken?: string
}>) {
    return await requestOrNull<VenueDetail>(`/venues/${encodeURIComponent(venueId)}`, {
        authToken,
        clientMode,
        ...(authToken ? {noCache: true} : {})
    })
}

const venueBody = (venue: Partial<VenueDetail>, placeId: string | null) => ({
    venue: {
        name: venue.name,
        capacity: venue.capacity,
        website: venue.website,
        about: venue.about,
        featured_image_url: venue.featured_image_url,
        place_id: placeId ?? venue.place_id,
        require_approval: venue.require_approval,
        group_id: venue.group_id,
        amenities: venue.amenities || undefined,
        tags: venue.tags || undefined,
        image_urls: venue.image_urls || undefined,
        track_ids: venue.track_ids || undefined,
        start_date: venue.start_date,
        end_date: venue.end_date
    }
})

export const createVenue = async function ({params: {venue, authToken}, clientMode}: SolaSdkFunctionParams<{
    venue: Partial<VenueDetail> & {name: string, group_id: string},
    authToken: string
}>) {
    const placeId = await resolvePlaceId({params: {...venue, authToken}, clientMode})
    const created = await request<VenueDetail>('/venues', {
        method: 'POST',
        clientMode,
        authToken,
        body: venueBody(venue, placeId)
    })

    if (venue.availabilities?.length) {
        await setVenueAvailability({params: {venueId: created.id, availabilities: venue.availabilities, authToken}, clientMode})
    }
    return created
}

export const updateVenue = async function ({params: {venue, authToken}, clientMode}: SolaSdkFunctionParams<{
    venue: Partial<VenueDetail> & {id: string},
    authToken: string
}>) {
    const placeId = await resolvePlaceId({params: {...venue, authToken}, clientMode})
    const updated = await request<VenueDetail>(`/venues/${venue.id}`, {
        method: 'PATCH',
        clientMode,
        authToken,
        body: venueBody(venue, placeId)
    })

    if (venue.availabilities) {
        await setVenueAvailability({params: {venueId: venue.id, availabilities: venue.availabilities, authToken}, clientMode})
    }
    return updated
}

export const removeVenue = async function ({params: {venueId, authToken}, clientMode}: SolaSdkFunctionParams<{
    venueId: string,
    authToken: string
}>) {
    await request(`/venues/${venueId}`, {
        method: 'DELETE',
        clientMode,
        authToken
    })
}

/**
 * Replaces the venue's whole availability set
 */
export const setVenueAvailability = async function ({params, clientMode}: SolaSdkFunctionParams<{
    venueId: string,
    availabilities: VenueAvailability[],
    authToken: string
}>) {
    return await request<VenueDetail>(`/venues/${params.venueId}/availability`, {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {
            availabilities: params.availabilities.map(({id: _id, ...a}) => a)
        }
    })
}

/**
 * First event clashing with the given window (event editor pre-submit check)
 */
export const getVenueConflict = async function ({params, clientMode}: SolaSdkFunctionParams<{
    venueId: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string,
    authToken: string
}>) {
    const data = await request<{event: any | null}>(`/venues/${params.venueId}/conflict`, {
        clientMode,
        authToken: params.authToken,
        params: {
            start_time: params.startTime,
            end_time: params.endTime,
            exclude_event_id: params.excludeEventId
        }
    })
    return data.event
}
