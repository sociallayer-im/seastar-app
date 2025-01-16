import {getGqlClient, getSdkConfig} from "../client"
import {GET_FOLLOWING_AND_FOLLOWER_BY_HANDLE, GET_PROFILE_BY_HANDLE} from "./schemas"
import {ProfileDetail} from "./types"
import Profile = Solar.Profile

/**
 * Get profile detail by handle
 * @param handle - profile handle
 */
export const getProfileDetailByHandle = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
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

    const url = `${getSdkConfig().api}/profile/me?auth_token=${authToken}`
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
    const response = await fetch(`${getSdkConfig().api}/profile/update`, {
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


export const getProfileFollowerAndFollowing = async (handle: string) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_FOLLOWING_AND_FOLLOWER_BY_HANDLE,
        variables: {handle}
    })

    return {
        profile: response.data.profile[0] as Profile || null,
        followers: response.data.followers.map((f: any) => f.source) as Profile[],
        followings: response.data.followings.map((f: any) => f.target) as Profile[]
    }
}