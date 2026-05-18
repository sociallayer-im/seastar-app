import {SolaSdkFunctionParams} from './types'
import {getSdkConfig} from './client'
import {Profile} from './profile'
import {Group} from './group'
import {BadgeClass} from './badge'
import {Event} from './event'
import {fixDate} from './uitls'

export const uploadFile = async ({params, clientMode}: SolaSdkFunctionParams<{ file: Blob, authToken: string }>) => {
    const formData = new FormData()
    formData.append('auth_token', params.authToken)
    formData.append('uploader', 'user')
    formData.append('resource', Math.random().toString(36).slice(-8))
    formData.append('data', params.file)

    const response = await fetch(`${getSdkConfig(clientMode).api}/service/upload_image`, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.result.url as string
}

export const search = async ({params, clientMode}: SolaSdkFunctionParams<{ keyword: string }>) => {
    const apiUrl = getSdkConfig(clientMode).api
    const resp = await fetch(`${apiUrl}/search?keyword=${encodeURIComponent(params.keyword)}`)
    if (!resp.ok) return { events: [], groups: [], profiles: [], badgeClasses: [] }
    const data = await resp.json()
    return {
        events: (data.events || []).map((e: Event) => fixDate(e)),
        groups: (data.groups || []) as Group[],
        profiles: (data.profiles || []) as Profile[],
        badgeClasses: (data.badge_classes || []) as BadgeClass[]
    }
}

export const genDaimoLink = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId: number,
    authToken: string,
    redirectUri?: string
}>) => {
    const res = await fetch(`${getSdkConfig(clientMode).api}/ticket/daimo_create_payment_link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_token: params.authToken,
            ticket_item_id: params.ticketItemId,
            redirect_uri: params.redirectUri
        })
    })

    if (!res.ok) {
        throw new Error('Failed to generate payment link')
    }

    const data = await res.json()

    return data as {
        id: string,
        url: string,
    }
}

export async function requestEmailCode({clientMode, params}:SolaSdkFunctionParams<{email: string}>): Promise<void> {
    const res = await fetch(`${getSdkConfig(clientMode).api}/service/send_email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: params.email,
        })
    })

    const data = await res.json()

    if (data.result === 'error') {
        throw new Error(data.message || 'Request fail')
    }
}
