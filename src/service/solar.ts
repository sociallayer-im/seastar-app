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
    return data as Solar.Event
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
    return data.url as string
}

export const updateProfile = async (profile: Solar.Profile, auth_token: string) => {
    const response = await fetch(`${api}/profile/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...profile,
            auth_token,
            social_links: JSON.stringify(profile.social_links || {})})
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}
