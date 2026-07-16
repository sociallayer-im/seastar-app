import {Group} from '../group'
import {Profile} from '../profile'
import {Place} from '../place'
import {DraftLocationFields} from '../place'

/** MarkerBlueprint. Geo lives on `place` (place.latitude/longitude). */
export interface Marker {
    id: string
    category: string | null
    pin_image_url: string | null
    cover_image_url: string | null
    title: string
    about: string | null
    link: string | null
    status: string | null
    data: Record<string, any> | null
    created_at: string
    place: Place | null
    group: Group | null
    owner: Profile | null
}

export type MarkerDetail = Marker

/**
 * Editor draft. Flat location fields are resolved to a place_id before the
 * write (markers require a place).
 */
export interface MarkerDraft extends DraftLocationFields {
    id?: string
    group_id: string
    category: string | null
    pin_image_url?: string | null
    cover_image_url?: string | null
    title: string
    about?: string | null
    link?: string | null
    status?: string | null
    data?: Record<string, any> | null
}
