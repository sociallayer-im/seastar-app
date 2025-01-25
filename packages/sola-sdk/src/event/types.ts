import {Profile} from '../profile'
import {Group} from '../group'
import {BadgeClass} from '../badge'

export interface Event {
    id: number,
    title: string,
    event_type: string,
    start_time: string,
    end_time: string,
    timezone: string,
    meeting_url: string | null,
    location: string | null,
    cover_url: string | null,
    tags: string[] | null,
    event_roles: EventRole[] | null,
    owner: Profile,
    group_id?: number,
    status: string | null,
    track_id: number | null,
    pinned: boolean
}

export interface EventDetail extends Event {
    formatted_address: string | null,
    geo_lat: string | null,
    geo_lng: string | null,
    content: string | null,
    max_participant: number | null,
    min_participant: number | null,
    participants_count: number,
    badge_class_id: number | null,
    external_url: string | null,
    notes: string | null,
    venue: string | null,
    group: Group,
    tickets: Ticket[] | null
    location_data: string | null,
    venue_id: number | null,
    display: string | null,
    participants: Participant[] | null
    track: Track | null
    extra: number[] | null,
    operators: number[] | null
    event_roles: EventRoleDetail[] | null
}

export interface Ticket {
    tracks_allowed: null | number[],
    id: number,
    check_badge_class_id: number | null
    check_badge_class: BadgeClass | null
    content: string,
    created_at: string,
    end_time: string | null
    event_id: number,
    need_approval: boolean
    payment_chain: string | null
    payment_target_address: string | null
    payment_token_address: string | null
    payment_token_price: string | null
    payment_token_name: string | null
    quantity: number | null,
    status: string
    title: string,
    payment_metadata: {
        payment_chain: string | null
        payment_target_address: string | null
        payment_token_address: string | null
        payment_token_price: string | null
        payment_token_name: string | null
    }[],
    payment_methods: PaymentMethod[]
    payment_methods_attributes: PaymentMethod[]
    ticket_type: string
}

export interface PaymentMethod {
    id?: number
    item_type: string // 'Ticket'
    item_id?: number // ticket id
    chain: string
    token_name:  null |string
    token_address:  null | string
    receiver_address: null | string
    price: number
    protocol: string
    _destroy?: string
}

export interface Participant {
    id: number,
    event_id: number,
    profile_id: number,
    role: string,
    status: string | null,
    created_at: string | null,
    ticket_id: number | null,
    payment_status: string | null,
    event: Event,
    profile: Profile,
    ticket: Ticket | null
    ticket_item?: {
        status: string
        sender_address: string
    }
}

export type EventRoleType = 'speaker' | 'co_host' | 'group_host'

export interface EventRole {
    id?: number
    event_id?: number | null
    item_id: number | null
    item_type: 'Profile' | 'Group',
    nickname: string | null
    role: EventRoleType
}

export interface EventRoleDetail extends EventRole {
    email?: string | null
    image_url: string | null
    profile?: Profile
    group?: Group
    _destroy?: string
    event: Event
}

export interface Track {
    id: number
    title: string
    kind: 'public' | 'private'
    about: string | null
    group_id: number
    start_date: string | null
    end_date: string| null
    manager_ids: number[] | null
    _destroy?: string
}

export interface Venue {
    id: number,
    title: string,
    visibility: null | 'all' | 'manager',
}

export interface VenueDetail extends Venue {
    location_data: string | null,
    location: string,
    about: string,
    group_id: number,
    owner_id: number,
    created_at: string,
    formatted_address: null | string,
    geo_lat: null | string,
    geo_lng: null | string,
    start_date: string | null,
    end_date: string | null,
    timeslots: null | string,
    link: string | null,
    capacity: number | null,
    overrides: null | string[],
    require_approval?: boolean,
    venue_timeslots: VenueTimeslot[]
    venue_overrides: VenueOverride[]
}

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface VenueTimeslot {
    id?: number
    venue_id?: number,
    day_of_week: Weekday,
    disabled: boolean,
    start_at: string,
    end_at: string,
    role: 'member' | 'manager' | 'all'
    _destroy?: string
}

export interface VenueOverride {
    id?: number
    venue_id: number,
    day: string, // '2022-01-01'
    disabled: boolean,
    start_at: string | null,
    end_at: string | null,
    role: 'member' | 'manager' | 'all'
    _destroy?: string
}

