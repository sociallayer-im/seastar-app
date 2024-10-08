const api = process.env.NEXT_PUBLIC_API_URL


export const getProfileByToken = async (auth_token?: string) => {
    if (!auth_token) return null
    const response = await fetch(`${api}/profile/me?auth_token=${auth_token}`)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}

export const getProfileByHandle = async (handle: string) => {
    const response = await fetch(`${api}/profile/get_by_handle?handle=${handle}`)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as Solar.Profile
}
