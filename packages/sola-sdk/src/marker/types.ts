import {Group} from '../group'
import {Profile} from '../profile'
import {BadgeClass} from '../badge'

export interface Marker {
    id: number
    owner_id: number
    group_id: number
    marker_type: string | null
    category: string
    pin_image_url: string | null
    cover_image_url: string | null
    title: string
    about: string | null
    link: string | null
    status: string | null
    location: string | null
    formatted_address: string | null
    geo_lat: number | null
    geo_lng: number | null
    location_data: string | null
    start_time: string | null
    end_time: string | null
    badge_class_id: number | null
    voucher_id: number | null
    map_checkins_count: number,
    marker_state: string | null
}

export interface MarkerDetail extends Marker {
    group: Group
    owner: Profile
    badge_class: BadgeClass | null
}