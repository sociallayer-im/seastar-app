import {Profile, SocialMedia} from '../profile'




export interface Group {
    id: number,
    handle: string,
    image_url: string | null,
    nickname: string | null,
}

export interface GroupDetail extends Group {
    about: string | null,
    social_links: SocialMedia,
    location: string | null,
    permissions: string[],
    status: string | null,
    event_tags: string[] | null,
    event_enabled: boolean,
    can_publish_event: string,
    can_join_event: string,
    can_view_event: string,
    map_enabled: boolean,
    banner_link_url: string | null,
    banner_image_url: string | null,
    banner_text: string | null,
    logo_url: string | null,
    memberships_count: number,
    events_count: number,
    group_tags: string[] | null,
    timezone: string | null,
    main_event_id: number | null,
    start_date: string | null,
    end_date: string | null,
    memberships: Membership[],
    tracks: Track[]
    venues: VenueDetail[]
}

export interface Membership {
    id: number,
    role: string,
    profile: Profile
    status: string
}

export interface MembershipDetail extends Membership {
    group: Group
}

export interface GroupWithOwner extends Group {
    owner: Profile
}


export interface Venue {
    id: number,
    title: string,
    visibility: null | 'all' | 'manager' | 'member' | 'everyone',
}

export interface VenueDetail extends Venue {
    location_data: string | null,
    location: string,
    about: string,
    group_id: number,
    owner_id: number,
    created_at: string,
    formatted_address: null | string,
    geo_lat: null | number,
    geo_lng: null | number,
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
export type VenueRole = 'member' | 'manager' | 'all'

export interface VenueTimeslot {
    id?: number
    venue_id?: number,
    day_of_week: Weekday,
    disabled: boolean,
    start_at: string,
    end_at: string,
    role: VenueRole
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

export interface TrackRole {
    id?: number,
    group_id: number | null,
    track_id: number | null,
    profile_id: number,
    receiver_address: string | null,
    role: string,
    profile: Profile
}

export interface Track {
    id: number
    title: string
    kind: 'public' | 'private'
    icon_url: string | null
    about: string | null
    group_id: number
    start_date: string | null
    end_date: string| null
    manager_ids: number[] | null
    _destroy?: string
}

export interface TrackDetail extends Track {
    track_roles: TrackRole[]
}