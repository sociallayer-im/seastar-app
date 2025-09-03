import {Profile} from '../profile'
import {Invite, BadgeClass, InviteDetail} from '../badge'

export interface Activity {
    id: number
    item_class_id: number | null
    item_id: number | null
    item_type: string
    data: string | null
    initiator_id: number
    target_id: string | null
    target_type: string | null
    action: string
    has_read: boolean
    created_at: string
    receiver_id: number | null
}

export interface ActivityDetail extends Activity {
    initiator: Profile
    group_invite?: InviteDetail
    badge_class?: BadgeClass
    memo?: string
}