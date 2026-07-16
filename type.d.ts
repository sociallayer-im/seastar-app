// Legacy Solar.* global types, aligned with the soon backend contract:
// string TSID ids everywhere, `name` (not `handle`) as the user/group slug,
// EventRole.display_name, Membership/Participant carry `user`.
declare namespace Solar {
    interface SocialMedia {
        twitter?: string | null,
        github?: string | null,
        discord?: string | null,
        ens?: string | null,
        lens?: string | null,
        nostr?: string | null,
        website?: string | null,
        farcaster?: string | null,
        telegram?: string | null,
    }

    interface Profile {
        id: string
        name: string,
        email?: string | null,
        image_url: string | null,
        nickname: string | null,
        bio?: string | null,
        eth?: string | null,
        social_links?: SocialMedia | null
    }

    export type ProfileSample = Pick<Profile, 'id' | 'name' | 'nickname' | 'image_url'>

    export interface Place {
        id: string,
        name: string,
        address: string | null,
        latitude: number | null,
        longitude: number | null,
        description?: string | null,
        data?: Record<string, unknown> | null,
    }

    export interface Event {
        id: string,
        title: string,
        start_time: string,
        end_time: string,
        timezone: string | null,
        meeting_url: string | null,
        image_url: string | null,
        content: string | null,
        tags: string[] | null,
        max_participant: number | null,
        participant_count?: number,
        external_url: string | null,
        group?: GroupSample | null,
        tickets?: Ticket[] | null
        owner?: ProfileSample,
        event_roles?: EventRole[] | null,
        status: string | null,
        visibility?: string | null,
        track_id: string | null,
        venue_id: string | null,
        place?: Place | null,
        pinned?: boolean
        participants?: Participant[] | null
    }

    export interface PaymentMethod {
        id?: string
        item_type?: string // 'Ticket'
        item_id?: string
        chain: string | null
        token_name: null | string
        token_address?: null | string
        receiver_address: null | string
        price: number
        protocol: string | null
        chains?: string[]
        _destroy?: string
    }

    export interface Ticket {
        id: string,
        tracks_allowed: string[] | null,
        check_badge_class_id: string | null
        check_badge_class?: BadgeClass | null
        content: string | null,
        created_at: string,
        end_time: string | null
        event_id: string,
        need_approval: boolean | null
        quantity: number | null,
        status: string
        title: string | null,
        payment_methods?: PaymentMethod[]
        payment_methods_attributes?: PaymentMethod[]
        ticket_type: string
    }

    export interface Venue {
        id: string
        name: string
        about: string | null
        group_id?: string
        capacity: number | null
        require_approval?: boolean | null
        tags: string[] | null
        website?: string | null
        featured_image_url?: string | null
        group?: GroupSample
    }

    export enum EventRoleType {
        Speaker = 'speaker',
        CoHost = 'co_host',
        GroupHost = 'group_host',
        CustomHost = 'custom_host'
    }

    export interface EventRole {
        id?: string
        event_id?: string | null
        item_id: string | null
        email?: string | null
        display_name: string | null
        image_url: string | null
        role: EventRoleType
        profile?: ProfileSample
        group?: GroupSample
        item_type: 'User' | 'Group',
        _destroy?: string
    }

    export interface Group {
        id: string,
        name: string,
        nickname: string | null,
        image_url: string | null,
        bio?: string | null,
        social_links?: SocialMedia | null,
        location?: string | null,
        can_publish_event?: string,
        can_join_event?: string,
        can_view_event?: string,
        banner_link_url?: string | null,
        banner_image_url?: string | null,
        banner_text?: string | null,
        logo_url?: string | null,
        memberships_count?: number,
        events_count?: number,
        group_tags?: string[] | null,
        timezone?: string | null,
        start_date?: string | null,
        end_date?: string | null,
    }

    export interface Membership {
        id: string,
        role: string,
        user: ProfileSample
    }

    export type GroupSample = Pick<Group, 'id' | 'name' | 'nickname' | 'image_url'>

    export interface SampleGroupWithOwner extends Solar.GroupSample {
        owner: Solar.ProfileSample,
        memberships: Solar.Membership[]
    }

    export interface BadgeClass {
        id: string,
        name?: string,
        title: string,
        creator_id?: string,
        image_url: string | null,
        metadata: string | null,
        content: string | null,
        group_id: string | null,
        transferable: null | boolean,
        badge_type: string | null,
        permissions: string[] | null
        created_at: string,
        display: string | null,
        can_send_badge: string,
        creator: ProfileSample,
        counter: number
    }

    export interface Badge {
        id: string
        image_url: string | null,
        title: string | null,
        creator_id?: string
        owner_id?: string,
        metadata?: string | null,
        content: string | null,
        display: string | null,
        value: number | string | null,
        created_at: string,
        badge_class: BadgeClass,
        creator: ProfileSample,
        owner: ProfileSample,
    }

    export interface Voucher {
        id: string
        sender_id: string
        badge_class_id: string,
        counter: number,
        expires_at: string | null
        created_at: string,
        badge_class: BadgeClass,
        sender: ProfileSample
        badges?: Badge[]
    }

    export interface Participant {
        id: string,
        event_id?: string,
        status: string | null,
        created_at: string | null,
        payment_status: string | null,
        register_time?: string | null,
        event?: Event,
        user: ProfileSample,
    }

    export interface Invite {
        id: string,
        sender_id?: string
        receiver_id?: string | null,
        group_id?: string,
        expires_at: string | null,
        role: string,
        status: string,
        receiver_address_type: string | null,
        receiver_address: string | null,
        receiver: ProfileSample | null,
        sender: ProfileSample,
        group: GroupSample
    }

    interface Track {
        id: string,
        name?: string,
        title: string,
        description?: string | null,
        image_url?: string | null,
        is_private?: boolean | null,
        group_id?: string,
        start_date: string | null,
        end_date: string | null,
        manager_ids?: string[] | null,
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
