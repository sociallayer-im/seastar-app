import {Profile} from '@sola/sdk'

export interface BadgeClass {
    id: number,
    title: string,
    creator_id: number,
    image_url: string | null,
    display: string | null,
}

export interface BadgeClassDetail extends BadgeClass {
    metadata: string | null,
    content: string | null,
    group_id: number | null,
    transferable: null | boolean,
    badge_type: string | null,
    permissions: string[] | null
    created_at: string,
    can_send_badge: string,
    creator: Profile,
    counter:number
}