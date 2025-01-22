import {Profile} from '../profile'
import {Group} from '../group'

export interface BadgeClass {
    id: number,
    title: string,
    creator_id: number,
    image_url: string | null,
    display: string | null,
    badge_type: string | null,
    group_id: number | null,
}

export interface BadgeClassDetail extends BadgeClass {
    metadata: string | null,
    content: string | null,
    transferable: null | boolean,
    permissions: string[] | null
    created_at: string,
    can_send_badge: string,
    creator: Profile,
    counter:number
    badges: Badge[]
    group: Group | null
}

export interface Badge {
    id: number
    image_url: string | null,
    title: string,
    owner_id: number
    creator_id: number
    display: string | null,
    badge_class: BadgeClass,
    owner: Profile,
    created_at: string
    content: string | null,
    voucher_id: number | null
}

export interface BadgeDetail extends Badge {
    metadata: string | null,
    value: string | null,
    badge_class: BadgeClassDetail,
    creator: Profile,
}

export interface Invite {
    id: number,
    sender_id: number
    receiver_id: number | null,
    group_id: number,
    created_at: string,
    expires_at: string,
    badge_class_id: number | null,
    badge_id: number | null,
    role: string,
    status: string,
    accepted: boolean
    message: string | null
    group: Group
}

export interface InviteDetail extends Invite {
    receiver_address_type: string | null,
    receiver_address: string | null,
    receiver: Profile | null,
    sender: Profile,
}