import {SolaSdkFunctionParams} from './types'
import {getSdkConfig} from './client'
import {request} from './request'
import {Profile} from './profile'
import {Group} from './group'
import {BadgeClass} from './badge'
import {Event} from './event'

/**
 * Upload an image to Cloudflare Images via the backend.
 * Multipart, so this uses raw fetch instead of the JSON request helper.
 */
export const uploadFile = async ({params, clientMode}: SolaSdkFunctionParams<{ file: Blob, authToken: string }>) => {
    const formData = new FormData()
    formData.append('file', params.file)

    const response = await fetch(`${getSdkConfig(clientMode).api}/api/v1/upload/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${params.authToken}`
        },
        body: formData
    })

    if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url as string
}

/**
 * Upload a document (POST /upload/file) — a CV, a deck, whatever an
 * application form asked for.
 *
 * Separate from `uploadFile` above, which despite its name is the *image*
 * rail: that one is fed a re-encoded PNG blob, while this must send the
 * original File untouched, because the backend keys the stored object off the
 * real bytes and keeps the real extension. Sending a Blob here would upload a
 * document with no name at all.
 */
export const uploadDocument = async ({params, clientMode}: SolaSdkFunctionParams<{
    file: File,
    authToken: string
}>) => {
    const formData = new FormData()
    formData.append('file', params.file, params.file.name)

    const response = await fetch(`${getSdkConfig(clientMode).api}/api/v1/upload/file`, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${params.authToken}`},
        body: formData
    })

    if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
    }

    const data = await response.json()
    return data as {url: string, filename: string, size: number}
}

/**
 * Global search (public)
 */
export const search = async ({params, clientMode}: SolaSdkFunctionParams<{ keyword: string }>) => {
    try {
        const data = await request<{
            events: Event[],
            groups: Group[],
            users: Profile[],
            badge_classes: BadgeClass[]
        }>('/search', {clientMode, params: {keyword: params.keyword}})

        return {
            events: data.events || [],
            groups: data.groups || [],
            profiles: data.users || [],
            badgeClasses: data.badge_classes || []
        }
    } catch {
        return {events: [], groups: [], profiles: [], badgeClasses: []}
    }
}
