import {SolaSdkFunctionParams} from '../types'
import {VenueAvailability, VenueDetail} from './types'
import {getSdkConfig} from '../client'

export const removeVenue = async function ({params: {venueId, authToken}, clientMode}: SolaSdkFunctionParams<{
    venueId: number,
    authToken: string
}>) {
    const res = await fetch(`${getSdkConfig(clientMode).api}/venue/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: venueId, auth_token: authToken})
    })

    if (!res.ok) {
        throw new Error(`Failed to remove ${res.statusText}`)
    }
}

export const getVenueDetailById = async function ({params: {venueId}, clientMode}: SolaSdkFunctionParams<{
    venueId: number
}>) {
    const resp = await fetch(`${getSdkConfig(clientMode).api}/venue/get?id=${venueId}`)
    const data = await resp.json()
    return data.venue as VenueDetail || null
}

export const updateVenue = async function ({params: {venue, authToken}, clientMode}: SolaSdkFunctionParams<{
    venue: VenueDetail,
    authToken: string
}>) {
    const venueDetail = await getVenueDetailById({params: {venueId: venue.id!}, clientMode})

    // Mark all existing availabilities for deletion
    const removedAvailabilities = (venueDetail!.availabilities || []).map(a => ({id: a.id, _destroy: '1'}))

    // New availabilities (without IDs — backend creates fresh records)
    const newAvailabilities = (venue.availabilities || []).map(({id: _, ...a}) => a)

    const props = {
        auth_token: authToken,
        id: venue.id!,
        venue: {
            ...venue,
            availabilities_attributes: [...removedAvailabilities, ...newAvailabilities],
            availabilities: undefined,
            // Also clear legacy tables so they don't diverge
            venue_timeslots_attributes: (venueDetail!.venue_timeslots || []).map(t => ({id: t.id, _destroy: '1'})),
            venue_timeslots: undefined,
            venue_overrides_attributes: (venueDetail!.venue_overrides || []).map(o => ({id: o.id, _destroy: '1'})),
            venue_overrides: undefined,
        }
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/venue/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error(`Failed to update ${res.statusText}`)
    }
}

export const createVenue = async function ({params: {venue, authToken}, clientMode}: SolaSdkFunctionParams<{
    venue: VenueDetail,
    authToken: string
}>) {
    const newAvailabilities: Omit<VenueAvailability, 'id'>[] = (venue.availabilities || []).map(({id: _, ...a}) => a)

    const props = {
        auth_token: authToken,
        group_id: venue.group_id!,
        venue: {
            ...venue,
            availabilities_attributes: newAvailabilities,
            availabilities: undefined,
            venue_timeslots_attributes: [],
            venue_timeslots: undefined,
            venue_overrides_attributes: [],
            venue_overrides: undefined,
        }
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/venue/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error(`Failed to create ${res.statusText}`)
    }
}
