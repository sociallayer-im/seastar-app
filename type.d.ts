declare namespace Solar {
    interface Profile {
        id?:number
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
        username: string
        nickname: string
        image_url: string
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
            group_host?: ProfileSample
        } | null
        venue: string | null,
        group: ProfileSample,
        tickets: string[] | null
        event_roles: string[] | null
    }
}
