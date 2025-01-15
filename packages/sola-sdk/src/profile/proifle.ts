import {gqlClient, getConfig} from "../client"
import {GET_PROFILE_BY_HANDLE} from "./schemas"
import {ProfileDetail} from "./types"

/**
 * Get profile detail by handle
 * @param handle - profile handle
 */
export const getProfileDetailByHandle = async (handle: string) => {
    const response = await gqlClient.query({
        query: GET_PROFILE_BY_HANDLE,
        variables: {handle}
    })

    if (!response.data.profiles || !response.data.profiles.length) {
        return null
    }

    return  {
        ...response.data.profiles[0],
        follower_count: response.data.follower_count.aggregate.count,
        following_count: response.data.following_count.aggregate.count
    } as ProfileDetail
}

/**
 * Get profile detail by auth token
 * @param authToken - auth token
 */

export const getProfileDetailByAuth = async (authToken: string) => {
    if (!authToken) {
        throw new Error('No auth token provided')
    }

    const url = `${getConfig().api}/profile/me?auth_token=${authToken}`
    // console.log(url)
    const response = await fetch(url)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as ProfileDetail
}

/**
 * Update profile
 * @param profile - profile detail
 * @param authToken - auth token
 */

export const updateProfile = async (profile: ProfileDetail, authToken: string) => {
    const response = await fetch(`${getConfig().api}/profile/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...profile, auth_token: authToken})
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.profile as ProfileDetail
}