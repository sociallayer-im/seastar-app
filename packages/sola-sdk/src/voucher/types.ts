import {BadgeDetail, BadgeClass, Profile} from '@sola/sdk'


export interface Voucher {
    id: number
    sender_id: number
    badge_class_id: number,
    counter: number,
    expires_at: string | null
    created_at: string,
    badge_class: BadgeClass,
    code?: string
    message: string | null
    strategy: 'account' | 'code' | 'event' | 'address' | 'email'
    receiver_id: number | null
}

export interface VoucherDetail extends Voucher {
    sender: Profile
    badges: BadgeDetail[]
}