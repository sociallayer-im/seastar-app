import {Badge, BadgeClass, Profile} from '@sola/sdk'


export interface Voucher {
    id: number
    sender_id: number
    badge_class_id: number,
    counter: number,
    expires_at: string | null
    created_at: string,
    badge_class: BadgeClass,
}

export interface VoucherDetail extends Voucher {
    sender: Profile
    badges: Badge[]
}