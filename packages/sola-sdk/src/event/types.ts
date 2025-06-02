import {Profile} from '../profile'
import {Group, Track, VenueDetail} from '../group'
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
    geo_lat: number | null,
    geo_lng: number | null,
    formatted_address: string | null
    display: string | null,
    track?: Track | null,
    venue: VenueDetail | null,
}

export interface EventWithJoinStatus extends Event {
    is_attending: boolean
    is_starred: boolean
    is_owner: boolean
}

export interface EventDetail extends Event {
    content: string | null,
    max_participant: number | null,
    min_participant: number | null,
    participants_count: number,
    badge_class_id: number | null,
    badge_class: BadgeClass | null,
    external_url: string | null,
    notes: string | null,
    venue: VenueDetail | null,
    group: Group,
    tickets: Ticket[] | null
    location_data: string | null,
    venue_id: number | null,
    display: string | null,
    participants: Participant[] | null
    requirement_tags: string[] | null
    track: Track | null
    extra: number[] | null,
    operators: number[] | null
    event_roles: EventRoleDetail[] | null
    recurring_id: number | null,
    ticket_items: TicketItem[]
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
    _destroy?: string
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

export type EventRoleType = 'speaker' | 'co_host' | 'group_host' | 'custom_host'

export interface EventRole {
    id?: number
    event_id?: number | null
    item_id: number | null
    item_type: 'Profile' | 'Group',
    nickname: string | null
    role: EventRoleType
    email?: string | null
    image_url: string | null
}

export interface EventRoleDetail extends EventRole {
    profile?: Profile
    group?: Group
    event: Event
    _destroy?: string
}

export interface TicketDraft  extends Pick<Ticket, 'title' | 'content' | 'check_badge_class_id' | 'quantity' | 'end_time' | 'payment_methods' | 'tracks_allowed' | 'ticket_type' | '_destroy'> {
    id?: number
}

export interface EventDraftType extends Pick<EventDetail, | 'recurring_id' | 'cover_url' | 'title' | 'track_id' | 'content' | 'notes' | 'venue_id' | 'geo_lat' | 'geo_lng' | 'formatted_address' | 'location_data' | 'location' | 'start_time' | 'end_time' | 'meeting_url'  | 'tags' | 'max_participant' | 'display' | 'pinned' | 'status' | 'badge_class_id' | 'requirement_tags'> {
    id?: number
    timezone: string | null
    tickets: TicketDraft[]
    event_roles: EventRole[] | null
    group_id: number
}

export interface Recurring {
    id: number,
    start_time: string | null,
    end_time: string | null,
    interval: string,
    timezone: string,
    event_count: number,
}

export interface TicketItem {
    id: number,
    status: string,
    profile_id: number,
    ticket_id: number,
    event_id: number,
    chain: string | null,
    txhash: string | null,
    amount: number | null,
    ticket_price: number | null,
    discount_value: string | null,
    discount_data: string |null,
    order_number: string | null,
    participant_id: number,
    ticket_type: string,
    group_id: number | null,
    tracks_allowed: null | string[],
    payment_method_id: number | null,
    token_address: string | null,
    receiver_address: string | null,
    coupon_id: number | null,
    sender_address: string | null,
    selector_type: string | null,
    selector_address: string | null,
    original_price: number | null,
    protocol: string | null,
    created_at: string | null,
    profile: Profile,
    ticket: {
        title: string
    }
}


export type DiscountType = 'ratio' | 'amount'

export interface Coupon {
    id?: number
    event_id?: number
    selector_type: string,
    code: string
    label: string,
    receiver_address: string | null,
    discount_type: DiscountType,
    discount: number,
    applicable_ticket_ids: number[] | null,
    ticket_item_ids: number[] | null,
    expires_at: string,
    max_allowed_usages: number
    order_usage_count: number
    _destroy?: string
}


