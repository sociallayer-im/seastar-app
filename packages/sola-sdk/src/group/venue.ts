import {SolaSdkFunctionParams} from '../types'
import {VenueDetail, VenueOverride, VenueTimeslot} from './types'
import {getGqlClient, getSdkConfig} from '../client'
import {GENT_VENUE_DETAIL_BY_ID} from './schemas'

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
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GENT_VENUE_DETAIL_BY_ID,
        variables: {id: venueId}
    })

    return response.data.venues[0] as VenueDetail || null
}

export const updateVenue = async function ({params: {venue, authToken}, clientMode}: SolaSdkFunctionParams<{
    venue: VenueDetail,
    authToken: string
}>) {
    const venueDetail = await getVenueDetailById({params: {venueId: venue.id!}, clientMode})
    const oldTimeslots = venueDetail!.venue_timeslots
    const removedTimeslots = oldTimeslots.map(oldTimeslot => {
        return {
            ...oldTimeslot,
            _destroy: '1'
        }
    })
    const oldOverrides = venueDetail!.venue_overrides
    const removedOverrides = oldOverrides.map(oldOverride => {
        return {
            ...oldOverride,
            _destroy: '1'
        }
    })

    let newTimeslots: VenueTimeslot[]  = venue.venue_timeslots.map(timeslot => ({...timeslot,  id: undefined}))
    if (!!removedTimeslots) {
        newTimeslots = newTimeslots?.concat(removedTimeslots)
    }

    let newOverrides: VenueOverride[]  = venue.venue_overrides.map(override => ({...override,  id: undefined}))
    if (!!removedOverrides) {
        newOverrides = newOverrides?.concat(removedOverrides)
    }

    const props = {
        auth_token: authToken,
        id: venue.id!,
        venue: {
            ...venue,
            venue_timeslots_attributes: newTimeslots,
            venue_timeslots: undefined,
            venue_overrides_attributes: newOverrides,
            venue_overrides: undefined
        }
    }

    // console.log('props', props)

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
    const newTimeslots: VenueTimeslot[]  = venue.venue_timeslots.map(timeslot => ({...timeslot,  id: undefined}))
    const newOverrides: VenueOverride[]  = venue.venue_overrides.map(override => ({...override,  id: undefined}))

    const props = {
        auth_token: authToken,
        group_id: venue.group_id!,
        venue: {
            ...venue,
            venue_timeslots_attributes: newTimeslots,
            venue_timeslots: undefined,
            venue_overrides_attributes: newOverrides,
            venue_overrides: undefined
        }
    }

    // console.log('props', props)

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