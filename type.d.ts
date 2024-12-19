declare namespace Solar {
    interface SocialMedia {
        twitter: string | null,
        github: string | null,
        discord: string | null,
        ens: string | null,
        lens: string | null,
        nostr: string | null,
        website: string | null,
        farcaster: string | null,
        telegram: string | null,
    }

    interface Profile {
        id:number
        handle: string,
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
        permissions: string,
        social_links: SocialMedia
    }

    export type ProfileSample = Pick<Profile, 'id' | 'handle' | 'nickname' | 'image_url'>

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
        event_roles: EventRole[] | null,
        location_data: string | null,
        status: string | null,
        track_id: number | null,
        venue_id: number | null,
    }

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
        visibility: string | null,
        location_data: string | null,
        group: GroupSample,
        venue_timeslots: VenueTimeslot[] | null
        venue_overrides: VenueOverride[] | null
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

    export interface Group {
        id: number,
        handle: string,
        nickname: string | null,
        image_url: string | null,
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
    }

    export interface Membership {
        id: number,
        role: string,
        profile: ProfileSample
    }

    export type GroupSample = Pick<Group, 'id' | 'handle' | 'nickname' | 'image_url'>

    export interface SampleGroupWithOwner extends Solar.GroupSample {
        owner: Solar.ProfileSample,
        memberships: Solar.Membership[]
    }

    export interface BadgeClass {
        id: number,
        title: string,
        creator_id: number,
        image_url: string | null,
        metadata: string | null,
        content: string | null,
        group_id: number | null,
        transferable: null | boolean,
        badge_type: string | null,
        permissions: string[] | null
        created_at: string,
        display: string | null,
        status: string | null,
        can_send_badge: string,
        creator: ProfileSample,
    }

    export interface Badge {
        id: number
        image_url: string | null,
        title: string,
        creator_id: number
        owner_id: number,
        metadata: string | null,
        content: string | null,
        display: string | null,
        value: string | null,
        created_at: string,
        badge_class: BadgeClass,
        creator: ProfileSample,
        owner: ProfileSample,
    }

    export interface Voucher {
        id: number
        sender_id: number
        badge_class_id: number,
        counter: number,
        expires_at: string | null
        created_at: string,
        badge_class: BadgeClass,
        sender: ProfileSample
        badges: Badge[]
    }

    export interface Participant {
        id: number,
        event_id: number,
        profile_id: number,
        role: string,
        status: string | null,
        created_at: string | null,
        ticket_id: string | null,
        payment_status: string | null,
        event: Event,
        profile: ProfileSample,
    }

    export interface Invite {
        id: number,
        sender_id: number
        receiver_id: number | null,
        group_id: number,
        expires_at: string,
        badge_class_id: number | null,
        badge_id: number | null,
        role: string,
        status: string,
        accepted: boolean
        receiver_address_type: string | null,
        receiver_address: string | null,
        badge_class: BadgeClass | null,
        receiver: ProfileSample | null,
        sender: ProfileSample,
        badges: Badge | null
        group: GroupSample
    }

    export interface Ticket {
        tracks_allowed: string[] | null,
        id: number,
        check_badge_class_id: number | null
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
        }[]
        payment_methods: PaymentMethod[]
        payment_methods_attributes: PaymentMethod[]
        ticket_type: string
    }

    interface Track {
        id: number,
        title: string,
        kind: string,
        group_id: string,
        start_date: string | null,
        end_date: string | null,
        manager_ids: string[] | null,
    }
}

declare namespace google.maps.places {
    interface QueryAutocompletePrediction {
        place_id?: string
        structured_formatting: {
            main_text: string,
            secondary_text: string
        }
    }
}
