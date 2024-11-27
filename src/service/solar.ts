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
