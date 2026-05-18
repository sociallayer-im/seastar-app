import {getSdkConfig} from "../client"
import {ProfileDetail, Profile} from "./types"
import {SolaSdkFunctionParams} from '../types'

/**
 * Get profile detail by handle
 * @param handle - profile handle
 */
export const getProfileDetailByHandle = async ({params, clientMode}:SolaSdkFunctionParams<{handle: string}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/profile/get_by_handle?handle=${encodeURIComponent(params.handle)}`)
    if (!resp.ok) return null
    const data = await resp.json()
    return (data.profile as ProfileDetail) || null
}

/**
 * Get profile detail by id
 * @param id
 */

export const getProfileDetailById = async ({params, clientMode}:SolaSdkFunctionParams<{id: number}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/profile/get_by_id?id=${params.id}`)
    if (!resp.ok) return null
    const data = await resp.json()
    return (data.profile as ProfileDetail) || null
}

/**
 * Get profile detail by auth token
 * @param authToken - auth token
 */
export const getProfileDetailByAuth = async ({params, clientMode}:SolaSdkFunctionParams<{authToken: string}>) => {
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
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/profile/followers?handle=${encodeURIComponent(params.handle)}`)
    if (!resp.ok) {
        return {
            profile: null,
            followers: [] as Profile[],
            followings: [] as Profile[]
        }
    }
    const data = await resp.json()
    return {
        profile: (data.profile as Profile) || null,
        followers: (data.followers || []) as Profile[],
        followings: (data.following || []) as Profile[]
    }
}

export const getProfileByHandlesOrAddresses  = async ({params, clientMode}:SolaSdkFunctionParams<{handlesOrAddresses: string[]}>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const handles = params.handlesOrAddresses.join(',')
    const resp = await fetch(`${apiUrl}/profile/batch?handles=${encodeURIComponent(handles)}`)
    if (!resp.ok) return { handleResult: [] as Profile[], addressResult: [] as Profile[] }
    const data = await resp.json()
    return {
        handleResult: (data.handle_result || []) as Profile[],
        addressResult: (data.address_result || []) as Profile[]
    }
}

export const searchProfile = async ({params, clientMode}:SolaSdkFunctionParams<{query: string, limit?: number}>) => {
    const resp = await fetch(`${getSdkConfig(clientMode).api}/profile/search?keyword=${encodeURIComponent(params.query)}&limit=${params.limit || 50}`)
    const data = await resp.json()
    return data.profiles as Profile[]
}

/**
 * Get profile detail by handle
 * @param email - profile email
 */
export const getProfileDetailByEmail = async ({params, clientMode}:SolaSdkFunctionParams<{email: string}>) => {

    const url = `${getSdkConfig(clientMode).api}/profile/get_by_email?email=${params.email}`
    const response = await fetch(url)

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.profile as ProfileDetail
}