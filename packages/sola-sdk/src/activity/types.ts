import {Profile} from '../profile'

/** soon ActivityBlueprint. */
export interface Activity {
    id: string
    action: string
    item_type: string | null
    item_id: string | null
    has_read: boolean
    payload: Record<string, unknown> | null
    created_at: string
}

export interface ActivityDetail extends Activity {
    initiator: Profile
}
