import {Badge, BadgeClass} from '../badge'
import {Profile} from '../profile'

/** soon VoucherBlueprint (code only in :with_code, badges only in :with_badges). */
export interface Voucher {
    id: string,
    counter: number,
    expires_at: string | null,
    created_at: string,
    badge_class_id: string,
    sender_id: string,
    receiver_id: string | null,
    receiver_address: string | null,
    strategy: 'code' | 'account' | 'address' | 'email' | 'event' | 'remember',
    message: string | null,
    badge_class: BadgeClass,
    sender: Profile,
    code?: string,
    badges?: Badge[],
}

/** Kept as an alias — soon's VoucherBlueprint has a single shape. */
export type VoucherDetail = Voucher
