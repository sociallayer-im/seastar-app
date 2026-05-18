import {EventDraftType} from '@sola/sdk'


const api = process.env.NEXT_PUBLIC_API_URL


export const getProfileByToken = async (auth_token?: string) => {
    if (!auth_token) return null
    const url = `${api}/profile/me?auth_token=${auth_token}`
    // console.log(url)
    const response = await fetch(url)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getProfileByHandle = async (handle: string) => {
    const url = `${api}/profile/get_by_handle?handle=${handle}`
    // console.log(url)
    const response = await fetch(url)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getEventDetail = async (event_id: number) => {
    const response = await fetch(`${api}/event/get?id=${event_id}`)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return {
        ...data,
        venue_id: data.venue?.id
    } as Solar.Event
}

export const uploadFile = async (file: Blob, auth_token: string) => {
    const formData = new FormData()
    formData.append('auth_token', auth_token)
    formData.append('uploader', 'user')
    formData.append('resource', Math.random().toString(36).slice(-8))
    formData.append('data', file)
    const response = await fetch(`${api}/service/upload_image`, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.result.url as string
}

export const updateProfile = async (profile: Solar.Profile, auth_token: string) => {
    const response = await fetch(`${api}/profile/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...profile, auth_token})
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getOccupiedTimeEvent = async (startTime: string, endTime: string, timezone: string, venueId: number | null, excludeEventId?: number) => {
    if (!venueId) return null
    const params = new URLSearchParams({
        venue_id: venueId.toString(),
        start_time: startTime,
        end_time: endTime,
    })
    if (excludeEventId) params.append('exclude_event_id', excludeEventId.toString())
    const response = await fetch(`${api}/event/check_venue_conflict?${params}`)
    const data = await response.json()
    return data.events?.[0] || null
}

export async function getBadgeClassDetailById(id: number) {
    const response = await fetch(`${api}/badge_class/get?id=${id}`)
    const data = await response.json()
    return data.badge_class as Solar.BadgeClass
}

export async function getUserBadgeClasses(userHandle: string) {
    const response = await fetch(`${api}/badge_class/by_user?handle=${userHandle}`)
    const data = await response.json()
    return data.badge_classes as Solar.BadgeClass[]
}

export async function getGroupBadgeClasses(groupId: number, limit = 20) {
    const response = await fetch(`${api}/badge_class/list?group_id=${groupId}&badge_type=badge&limit=${limit}`)
    const data = await response.json()
    return data.badge_classes as Solar.BadgeClass[]
}

export async function SearchProfile(keyword: string, limit = 5) {
    const response = await fetch(`${api}/profile/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`)
    const data = await response.json()
    return data.profiles as Solar.ProfileSample[]
}

export interface CreateEventProps extends EventDraftType {
    auth_token: string
}

export async function CreteEvent(props: CreateEventProps) {
    const eventProps = {
        ...props,
        extra: props.event_roles?.filter(r => !r.item_id && !!r.email).map(r => r.email),
        event_roles_attributes: props.event_roles
    }


    const response = await fetch(`${api}/event/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventProps)
    })

    if (!response.ok) {
        throw new Error('Create failed')
    }

    const data = await response.json()
    return data.evet as Solar.Event
}

export const updateGroup = async (group: Solar.Group, auth_token: string) => {
    const response = await fetch(`${api}/group/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...group,
            social_links: JSON.stringify(group.social_links),
            auth_token
        })
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.group as Solar.Group
}
