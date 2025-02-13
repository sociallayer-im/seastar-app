import {InviteDetail} from '../badge'
import {Voucher} from '../voucher'
import {Activity} from '../activity'

export interface SubscriptionInviteResponse {
    invites: InviteDetail[]
}

export interface SubscriptionVoucherResponse {
    vouchers: Voucher[]
}

export interface SubscriptionActivityResponse {
    activities: Activity[]
}