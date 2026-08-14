import {Profile} from '../profile'
import {Group, Track, VenueDetail} from '../group'
import {Place} from '../place'

export type EventKind = null | "talk" | "panel" | "workshop" | "activity" | "seminar" | "conference" | "meetup" | "networking" | "training" | "exhibition" | "other" | "hackathon" | "demoday" | "social" | "openmic" | "wellness"

/** VenueRefBlueprint — all an embedded event's venue ever carries. Fetch the
 *  venue by id (getVenueDetailById) for capacity/about/amenities/etc. */
export interface EventVenueRef {
    id: string,
    name: string,
}

/** TrackRefBlueprint — all an embedded event's track ever carries. */
export interface EventTrackRef {
    id: string,
    title: string,
}

/**
 * EventBlueprint (default view). Geo lives on `place`
 * (place.latitude/longitude); the event cover image is `image_url`.
 */
export interface Event {
    id: string,
    title: string,
    start_time: string,
    end_time: string,
    timezone: string | null,
    status: string | null,
    visibility: string | null,
    meeting_url: string | null,
    external_url: string | null,
    category: string | null,
    kind: EventKind,
    tags: string[] | null,
    pinned: boolean,
    max_participant: number | null,
    participant_count: number,
    require_approval: boolean | null,
    image_url: string | null,
    notes: string | null,
    /** Confirmed-attendees-only image (group QR code); the API omits it unless
     *  the viewer is the organizer or a settled attendee. */
    image_note?: string | null,
    recurring_id: string | null,
    form_id: string | null,
    created_at: string,
    group: Group | null,
    place: Place | null,
    venue: EventVenueRef | null,
    owner: Profile,
    track: EventTrackRef | null,
}

export interface EventWithJoinStatus extends Event {
    is_attending: boolean
    is_starred: boolean
    is_owner: boolean
}

/** EventBlueprint :extended — GET /events/:id. */
export interface EventDetail extends Event {
    content: string | null
    event_roles: EventRole[] | null
    /** Absent when the event was fetched with `includeParticipants: false` —
     *  fetch the list with getEventParticipants instead. */
    participants?: Participant[] | null
    /** The viewer's own RSVP, or null if they haven't joined. Emitted whenever
     *  the request carried a token, so it survives `participants` being left
     *  out. Undefined for an anonymous request. */
    current_participant?: Participant | null
    tickets: Ticket[] | null
}

/** TicketBlueprint (+ payment_methods in :extended). */
export interface Ticket {
    id: string,
    title: string | null,
    content: string | null,
    event_id: string,
    check_badge_class_id: string | null,
    /** Membership gate: only members of ANY of these groups may claim. Empty/null = open. */
    check_group_ids: string[] | null,
    quantity: number | null,
    end_time: string | null,
    need_approval: boolean | null,
    status: string,
    ticket_type: string,
    group_id: string | null,
    start_date: string | null,
    end_date: string | null,
    days_allowed: string[] | null,
    tracks_allowed: string[] | null,
    created_at: string,
    payment_methods?: PaymentMethod[]
}

/** PaymentMethodBlueprint. */
export interface PaymentMethod {
    id?: string
    chain: string | null
    kind?: string | null // 'crypto' | 'fiat' | 'credit'
    token_name: string | null
    token_address?: string | null
    receiver_address: string | null
    price: number
    protocol: string | null
    chains?: string[]
    /** 'usd' | 'cny' on fiat rails; null on crypto, whose unit is token_name.
     *  Set by the backend from the rail, so it never has to be sent on create. */
    currency?: string | null
    /** Which of the owner's Stripe keys this method charges to (chain 'stripe' only). */
    stripe_setting_id?: string | null
    _destroy?: string
}

/** ParticipantBlueprint. */
export interface Participant {
    id: string,
    /** attending | pending (awaiting approval) | declined | maybe | cancelled
     *  (withdrawn — the backend never lists these). Only "attending" holds a seat. */
    status: string | null,
    /** Derived summary of this participant's orders: succeeded | pending |
     *  cancelled, or null when the event has no ticket types. Never set on its own. */
    payment_status: string | null,
    /** When they RSVP'd — NOT a check-in marker. */
    registered_at: string | null,
    /** When a manager scanned them at the door; null until then. */
    checked_in_at: string | null,
    created_at: string | null,
    user: Profile,
}

export type EventRoleType = 'speaker' | 'co_host' | 'group_host' | 'custom_host' | 'member' | 'manager'

/** EventRoleBlueprint. */
export interface EventRole {
    id?: string
    event_id?: string | null
    item_id: string | null
    item_type: 'User' | 'Group',
    role: EventRoleType
    email?: string | null
    display_name: string | null
    image_url: string | null
    _destroy?: string
}

export interface TicketDraft extends Pick<Ticket, 'title' | 'content' | 'check_badge_class_id' | 'quantity' | 'end_time' | 'tracks_allowed' | 'ticket_type'> {
    id?: string
    payment_methods: PaymentMethod[]
    need_approval?: boolean | null
    check_group_ids?: string[] | null
    status?: string | null
    start_date?: string | null
    end_date?: string | null
    days_allowed?: string[] | null
    _destroy?: string
}

/**
 * What the event editor holds. Flat location fields are resolved to a
 * place_id (see resolvePlaceId) before the write hits the API.
 */
export interface EventDraftType {
    id?: string
    title: string
    content: string | null
    notes?: string | null
    start_time: string
    end_time: string
    timezone: string | null
    status?: string | null
    visibility?: string | null
    group_id: string
    venue_id: string | null
    track_id: string | null
    meeting_url: string | null
    external_url?: string | null
    max_participant: number | null
    require_approval?: boolean | null
    category?: string | null
    kind?: EventKind
    tags: string[] | null
    requirement_tags?: string[] | null
    pinned?: boolean
    image_url?: string | null
    image_note?: string | null
    recurring_id?: string | null
    tickets: TicketDraft[]
    event_roles: EventRole[] | null
    /** Designate this event as the group's ticket event (its tickets grant
     *  membership). Group-manager only; leave undefined to keep as-is. */
    is_group_ticket_event?: boolean
    // Flat location fields → resolvePlaceId
    location?: string | null
    formatted_address?: string | null
    geo_lat?: number | string | null
    geo_lng?: number | string | null
    location_data?: string | null
}

/** RecurringBlueprint (:with_events adds events). */
export interface Recurring {
    id: string,
    start_time: string | null,
    end_time: string | null,
    interval: string,
    timezone: string | null,
    event_count: number,
    created_at?: string,
    events?: Event[],
}

/** TicketItemBlueprint (user only present in :with_profile). */
export interface TicketItem {
    id: string,
    status: string | null,
    ticket_id: string,
    user_id: string | null,
    event_id: string | null,
    chain: string | null,
    txhash: string | null,
    amount: number | null,
    discount_value: number | null,
    discount_data: string | null,
    participant_id: string | null,
    ticket_type: string,
    group_id: string | null,
    auth_type: string | null,
    tracks_allowed: string[] | null,
    payment_method_id: string | null,
    coupon_id: string | null,
    sender_address: string | null,
    selector_type: string | null,
    selector_address: string | null,
    original_price: number | null,
    protocol: string | null,
    created_at: string | null,
    /** As charged: 'usd' | 'cny' on fiat rails, null on crypto (whose amount is
     *  scaled by the token's decimals, not by 100). An order keeps the currency
     *  it was taken in even if the rail's default later changes. */
    currency?: string | null,
    user?: Profile,
}

/** FormFieldBlueprint. */
export interface EventFormField {
    id: string,
    label: string,
    field_type: 'text' | 'select',
    required: boolean,
    for_admin?: boolean,
    position: number,
    options: string[],
}

/** FormBlueprint :extended. */
export interface EventForm {
    id: string,
    title: string,
    description: string | null,
    published?: boolean,
    fields: EventFormField[],
}

export interface FormAnswer {
    id: string,
    form_field_id: string,
    value: string | null,
}

/** FormSubmissionBlueprint. */
export interface FormSubmission {
    id: string,
    form_id: string,
    user_id: string,
    status: string,
    starred: boolean,
    admin_note: string | null,
    submitted_at: string,
    answers: FormAnswer[],
    user: Profile | null,
}

export type DiscountType = 'ratio' | 'amount'

/** CouponBlueprint (+code in :with_code). */
export interface Coupon {
    id?: string
    event_id?: string
    selector_type: string,
    code?: string
    label: string | null,
    receiver_address: string | null,
    discount_type: DiscountType,
    discount: number,
    applicable_ticket_ids: string[] | null,
    ticket_item_ids: string[] | null,
    expires_at: string | null,
    max_allowed_usages: number | null
    order_usage_count: number
    _destroy?: string
}
