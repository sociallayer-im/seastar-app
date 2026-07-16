import {Group} from '../group'

/**
 * PopupCity is a Group with a date range + location (no separate table).
 * Mapped client-side from GroupBlueprint :detail / GET /discover payloads.
 */
export interface PopupCity {
    id: string
    title: string          // = group.nickname || group.name
    name: string           // = group.name (slug)
    image_url: string | null
    banner_image_url: string | null
    location: string | null
    start_date: string | null
    end_date: string | null
    group_tags: string[] | null
    group_id: string       // = id (self)
    group: Pick<Group, 'id' | 'name' | 'nickname' | 'image_url'>
}

export interface PopupCityDraft {
    image_url: string | null
    location: string | null
    start_date: string | null
    end_date: string | null
    group_id: string
}
