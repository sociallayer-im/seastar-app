import {Profile, SocialMedia} from '../profile'
import {Track, Venue} from '../event'

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
    venues: Venue[]
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