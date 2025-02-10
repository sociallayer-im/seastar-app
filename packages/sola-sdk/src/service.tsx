import {SolaSdkFunctionParams} from './types'
import {getGqlClient, getSdkConfig} from './client'
import {gql} from '@apollo/client'
import {EVENT_FRAGMENT} from './event'
import {Profile, PROFILE_FRAGMENT} from './profile'
import {Group, GROUP_FRAGMENT} from './group'
import {BADGE_CLASS_FRAGMENT, BadgeClass} from './badge'
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
    const doc = gql`
        ${EVENT_FRAGMENT}
        ${PROFILE_FRAGMENT}
        ${GROUP_FRAGMENT}
        ${BADGE_CLASS_FRAGMENT}
        query Search($keyword: String!) {
             events: events(where: {
                    status: {_in: ["open", "published", "normal"]}, 
                    display: {_neq: "private"}, 
                    title: {_regex: $keyword}}, limit: 100, order_by: {id: desc}) 
                    {
                        ...EventFragment
                    },
                groups: groups(where: {
                    _or: [{handle: {_regex: $keyword}},{nickname: {_regex: $keyword}}]
                    }, limit: 100, order_by: {id: desc}) 
                    {
                        ...GroupFragment
                    },
                profiles: profiles(where: {
                    _or: [{handle: {_regex: $keyword}},{nickname: {_regex: $keyword}}]
                    }, limit: 100, order_by: {id: desc}) 
                    {
                        ...ProfileFragment
                    },
                badgeClasses: badge_classes(where: {
                    badge_type: {_neq: "private"},
                    _or: [{name: {_regex: $keyword}},{title: {_regex: $keyword}}]
                    }, limit: 100, order_by: {id: desc}) 
                    {
                        ...BadgeClassFragment
                    }
        }
    `

    const client = getGqlClient(clientMode)
    const response = await client.query({
        query: doc,
        variables: {keyword: params.keyword}
    })

    return {
        events: response.data.events.map((e: Event) => fixDate(e)),
        groups: response.data.groups as Group[],
        profiles: response.data.profiles as Profile[],
        badgeClasses: response.data.badgeClasses as BadgeClass[]
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
