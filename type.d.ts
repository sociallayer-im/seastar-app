declare namespace Solar {
    interface Profile {
        id:number
        handle: string | null,
        address: string | null,
        email: string | null,
        phone: string | null,
        zupass: string | null,
        status: 'active' | 'freezed'
        image_url: string | null,
        nickname: string | null,
        about: string | null,
        location: string | null,
        sol_address: string | null,
        farcaster_fid: string | null,
        farcaster_address: string | null,
        extras: string,
        permissions: string
    }

    export interface ProfileSample {
        id: number
        handle: string
        nickname: string | null
        image_url: string  | null
    }

    export interface Event {
        id: number,
        title: string,
        event_type: string,
        start_time: string,
        end_time: string,
        timezone: string,
        meeting_url: string | null,
        location: string | null,
        formatted_address: string | null,
        geo_lat: string | null,
        geo_lng: string | null,
        cover_url: string | null,
        content: string | null,
        tags: string[] | null,
        max_participants: number | null,
        min_participants: number | null,
        participants_count: number,
        badge_class_id: number | null,
        external_url: string | null,
        notes: string | null,
        host_info: {
            speaker?: ProfileSample[]
            co_host?: ProfileSample[]
            group_host?: ProfileSample[]
        } | null
        venue: string | null,
        group: ProfileSample,
        tickets: string[] | null
        owner: ProfileSample,
        event_roles: EventRole[] | null
    }

    export interface Venue {
        id: number
        title: string
        location: string
        about: string
        group_id: number
        owner_id: number
        formatted_address: string
        geo_lat: string
        geo_lng: string
        created_at: string
        start_date: string
        end_date: string
        timeslots: string[] | null
        link: string
        capacity: number
        overrides: string[] | null
        require_approval: boolean | null
        tags: string[] | null
        removed: boolean | null
        visibility: string | null
    }

    export interface Track {
        tag: string
        id: number
        title: string
        about: string | null
        start_date: string | null
        end_date: string | null
        icon_url: string | null
    }

    export interface EventRole {
        id: number
        event_id: number | null
        item_id: number | null
        email: string | null
        nickname: string | null
        image_url: string | null
        role: 'speaker' | 'co_host' | 'group_host'
        item_type: 'Profile' | 'Group'
    }
}
