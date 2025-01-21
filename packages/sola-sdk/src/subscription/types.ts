import {InviteDetail} from '../badge'
import {Voucher} from '../voucher'

export interface SubscriptionInviteResponse {
    invites: InviteDetail[]
}

export interface SubscriptionVoucherResponse {
    vouchers: Voucher[]
}