import {Profile, SocialMedia} from '../profile'

export interface Group {
    id: string
    name: string
    nickname: string | null
    image_url: string | null
    logo_url: string | null
    created_at?: string
}

/**
 * The :detail view — the full group-page payload.
 */
export interface GroupDetail extends Group {
    bio: string | null
    location: string | null
    timezone: string | null
    start_date: string | null
    end_date: string | null
    active: boolean
    banner_image_url: string | null
    banner_link_url: string | null
    banner_text: string | null
    social_links: SocialMedia | null
    group_tags: string[] | null
    event_tag_list: string[] | null
    requirement_tag_list: string[] | null
    venue_tag_list: string[] | null
    can_publish_event: string
    can_join_event: string
    can_view_event: string
    memberships_count: number
    events_count: number
    parent_id: string | null
    parent: Group | null
    children: Group[]
    tracks: Track[]
    venues: Venue[]
    memberships: Membership[]
}

export interface Membership {
    id: string
    role: string
    active: boolean
    created_at: string
    user: Profile
}

/**
 * The :with_group view — memberships listed from a user's perspective.
 */
export interface MembershipDetail extends Omit<Membership, 'user'> {
    user?: Profile
    group: Group
}

export interface GroupWithOwner extends Group {
    owner?: Profile
    role?: string
}

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface VenueAvailability {
    id?: string
    day_of_week: Weekday | null   // weekly slot; null for date-specific overrides
    day: string | null            // 'YYYY-MM-DD'; null for weekly slots
    intervals: [string, string][] // e.g. [["09:30","21:00"]]; empty = closed
    role_required?: string | null
}

export interface Venue {
    id: string
    name: string
    capacity: number | null
    website: string | null
    about: string | null
    amenities: string[] | null
    tags: string[] | null
    featured_image_url: string | null
    /** Overall booking window — a venue with no bounds here is bookable any date. */
    start_date: string | null
    end_date: string | null
    archived: boolean
}

/**
 * The :with_availability view (venue detail), plus the writable fields.
 */
export interface VenueDetail extends Venue {
    availabilities: VenueAvailability[]
    group_id?: string
    place_id?: string | null
    require_approval?: boolean
    image_urls?: string[]
    track_ids?: string[]
}

export interface TrackRole {
    id: string
    role: string
    created_at?: string
    user: Profile
}

export interface Track {
    id: string
    name: string
    title: string
    description: string | null
    image_url: string | null
    is_private: boolean | null
    start_date: string | null
    end_date: string | null
    created_at?: string
    group?: Group
}

export interface TrackDetail extends Track {
    track_roles: TrackRole[]
}
