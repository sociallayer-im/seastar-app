import {getGqlClient, getSdkConfig} from "../client"
import {
    GET_FOLLOWING_AND_FOLLOWER_BY_HANDLE,
    GET_PROFILE_BY_HANDLE,
    GET_PROFILE_BY_HANDLES_OR_ADDRESSES, GET_PROFILE_BY_ID, SEARCH_PROFILE
} from "./schemas"
import {ProfileDetail, Profile} from "./types"
import {SolaSdkFunctionParams} from '../types'

/**
 * Get profile detail by handle
 * @param handle - profile handle
 */
export const getProfileDetailByHandle = async ({params, clientMode}:SolaSdkFunctionParams<{handle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_PROFILE_BY_HANDLE,
        variables: {handle: params.handle}
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
 * Get profile detail by id
 * @param id
 */

export const getProfileDetailById = async ({params, clientMode}:SolaSdkFunctionParams<{id: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_PROFILE_BY_ID,
        variables: {id: params.id}
    })

    if (!response.data.profiles || !response.data.profiles.length) {
        return null
    }

    return response.data.profiles[0] as ProfileDetail
}

/**
 * Get profile detail by auth token
 * @param authToken - auth token
 */
export const getProfileDetailByAuth = async ({params, clientMode}:SolaSdkFunctionParams<{authToken: string}>) => {
    console.trace('getProfileDetailByAuth ===>')
    if (!params.authToken) {
        throw new Error('No auth token provided')
    }

    const url = `${getSdkConfig(clientMode).api}/profile/me?auth_token=${params.authToken}`
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
export const updateProfile = async ({params, clientMode}:SolaSdkFunctionParams<{profile: ProfileDetail, authToken: string}>) => {
    const response = await fetch(`${getSdkConfig(clientMode).api}/profile/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...params.profile, auth_token: params.authToken})
    })

    if (!response.ok) {
        throw new Error('Update failed')
    }

    const data = await response.json()
    return data.profile as ProfileDetail
}


export const getProfileFollowerAndFollowing = async ({params, clientMode}:SolaSdkFunctionParams<{handle: string}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_FOLLOWING_AND_FOLLOWER_BY_HANDLE,
        variables: {handle: params.handle}
    })

    return {
        profile: response.data.profile[0] as Profile || null,
        followers: response.data.followers.map((f: any) => f.source) as Profile[],
        followings: response.data.followings.map((f: any) => f.target) as Profile[]
    }
}

export const getProfileByHandlesOrAddresses  = async ({params, clientMode}:SolaSdkFunctionParams<{handlesOrAddresses: string[]}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: GET_PROFILE_BY_HANDLES_OR_ADDRESSES,
        variables: {handles: params.handlesOrAddresses}
    })

    return {
        handleResult: response.data.handleResult as Profile[],
        addressResult: response.data.addressResult as Profile[]
    }
}

export const searchProfile = async ({params, clientMode}:SolaSdkFunctionParams<{query: string, limit?: number}>) => {
    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: SEARCH_PROFILE,
        variables: {keyword: params.query, limit: params.limit || 50}
    })

    let result = [] as  Profile[]
    response.data.exact.forEach((profile: Profile) => {
        if (!result.find((r: Profile) => r.id === profile.id)) {
            result.push(profile)
        }
    })

    response.data.predict.forEach((profile: Profile) => {
        if (!result.find((r: Profile) => r.id === profile.id)) {
            result.push(profile)
        }
    })

    return result
}