import {Profile} from '../profile'
import {Group} from '../group'

export interface BadgeClass {
    id: string,
    name: string,
    title: string,
    creator: Profile,
    image_url: string | null,
    display: string | null,
    badge_type: string | null,
    group_id: string | null,
    metadata: string | null,
    content: string | null,
    transferable: boolean | null,
    revocable: boolean | null,
    weighted: boolean | null,
    encrypted: boolean | null,
    permissions: string[] | null,
    can_send_badge: string,
    counter: number,
    created_at: string,
}

/** Kept as an alias — soon's BadgeClassBlueprint has a single shape. */
export type BadgeClassDetail = BadgeClass

export interface Badge {
    id: string,
    index: number | null,
    title: string,
    image_url: string | null,
    content: string | null,
    status: string,
    display: string | null,
    value: number | null,
    start_time: string | null,
    end_time: string | null,
    created_at: string,
    badge_class: BadgeClass,
    creator: Profile,
    owner: Profile,
}

/** Kept as an alias — soon's BadgeBlueprint has a single shape. */
export type BadgeDetail = Badge

/** soon GroupInviteBlueprint. */
export interface Invite {
    id: string,
    status: string,
    role: string,
    message: string | null,
    expires_at: string | null,
    receiver_address_type: 'id' | 'email' | 'code' | null,
    receiver_address: string | null,
    created_at: string,
    sender: Profile | null,
    receiver: Profile | null,
    group: Group,
}

/** Kept as an alias — soon's GroupInviteBlueprint has a single shape. */
export type InviteDetail = Invite

export interface GroupTicket {
    id: string,
    title: string,
    ticket_type: string,
    status: string,
    start_date: string | null,
    end_date: string | null,
    days_allowed: string[] | null,
    tracks_allowed: string[] | null,
}
