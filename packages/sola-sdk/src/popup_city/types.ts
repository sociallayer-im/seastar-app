import {Group} from '../group'

export interface PopupCity {
    id: number
    image_url: string | null
    location: string | null
    start_date: string | null
    title: string
    updated_at: string | null
    website: string | null
    created_at: string | null
    end_date: string | null
    group_id: string | null,
    group: Group
    group_tags: string[] | null
}