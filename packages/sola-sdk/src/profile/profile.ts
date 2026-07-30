import {request, requestOrNull} from '../request'
import {ProfileDetail, Profile} from './types'
import {SolaSdkFunctionParams} from '../types'

/**
 * Get profile detail by name (public)
 * @param name - profile name (the unique username slug)
 */
export const getProfileDetailByName = async ({params, clientMode}: SolaSdkFunctionParams<{name: string}>) => {
    return await requestOrNull<ProfileDetail>(`/users/${encodeURIComponent(params.name)}`, {clientMode})
}

/**
 * Get profile detail by id
 * @param id - user TSID
 */
export const getProfileDetailById = async ({params, clientMode}: SolaSdkFunctionParams<{id: string}>) => {
    return await requestOrNull<ProfileDetail>(`/users/${encodeURIComponent(params.id)}`, {clientMode})
}

/**
 * Get the authenticated user's own profile (includes email)
 * @param authToken - auth token
 */
export const getProfileDetailByAuth = async ({params, clientMode}: SolaSdkFunctionParams<{authToken: string}>) => {
    if (!params.authToken) {
        throw new Error('No auth token provided')
    }

    try {
        return await request<ProfileDetail>('/users/me', {
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
    } catch {
        return null
    }
}

/**
 * Update the authenticated user's profile
 * @param profile - fields to update (name, nickname, bio, image_url)
 * @param authToken - auth token
 */
export const updateProfile = async ({params, clientMode}: SolaSdkFunctionParams<{profile: Partial<ProfileDetail>, authToken: string}>) => {
    return await request<ProfileDetail>('/users/me', {
        method: 'PATCH',
        clientMode,
        authToken: params.authToken,
        body: {
            user: {
                name: params.profile.name,
                nickname: params.profile.nickname,
                bio: params.profile.bio,
                image_url: params.profile.image_url
            }
        }
    })
}

// requestEmailCode / verifyEmailCode moved to ../auth — they belong with the
// rest of the sign-in flow (nonce, verify_wallet, bind_email), and the version
// there also carries the `context` argument the bind-email flow needs.

/**
 * Search profiles by keyword (public)
 */
export const searchProfile = async ({params, clientMode}: SolaSdkFunctionParams<{keyword: string, limit?: number}>) => {
    const data = await request<{users: Profile[]}>('/search', {
        clientMode,
        params: {keyword: params.keyword}
    })
    const users = data.users || []
    return params.limit ? users.slice(0, params.limit) : users
}
