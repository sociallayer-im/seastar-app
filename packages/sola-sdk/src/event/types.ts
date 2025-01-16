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
}

