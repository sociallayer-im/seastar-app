import {Group} from '../group'

// PopupCity is now backed directly by a Group record.
// id, image_url, location, website, start_date, end_date come from the group itself.
// group is self-referential (group.id === popup_city.id).
export interface PopupCity {
    id: number
    title: string          // = group.nickname
    handle: string         // = group.handle
    image_url: string | null
    banner_image_url: string | null
    location: string | null
    start_date: string | null
    end_date: string | null
    website: string | null
    group_tags: string[] | null
    group_id: number       // = id (self)
    group: Pick<Group, 'id' | 'handle' | 'nickname' | 'image_url'>
}

export interface PopupCityDraft {
    image_url: string | null
    location: string | null
    website: string | null
    start_date: string | null
    end_date: string | null
    group_id: number
}
