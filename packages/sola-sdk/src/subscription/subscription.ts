import {createClient} from 'graphql-ws'
import {getSdkConfig} from '../client'
import {SUBSCRIPTION_INVITE_SCHEMES, SUBSCRIPTION_VOUCHER_SCHEMES} from './schemas'
import {SubscriptionInviteResponse, SubscriptionVoucherResponse} from './types'
import {ProfileDetail} from '../profile'

export const wsClient = createClient({
    url: getSdkConfig().graphql.replace('https', 'wss'),
})

export interface SubscribeInviteOptions {
    profile: ProfileDetail
    onMessage?: (res: SubscriptionInviteResponse) => void
    onError?: (error: Error) => void
    onComplete?: () => void
}

export const subscriptingInvite = ({onMessage, onError, onComplete, profile}: SubscribeInviteOptions) => {
    const now = new Date().toISOString()

    wsClient.subscribe({
        query: SUBSCRIPTION_INVITE_SCHEMES.loc!.source.body,
        variables: {
            profile_id: profile.id,
            addresses: [profile.email || '', profile.address || ''],
            now
        }
    }, {
        next: (data) => {
            onMessage && onMessage(data.data as unknown as SubscriptionInviteResponse)
        },
        error: (error) => {
            console.error(error)
            onError && onError(error as Error)
        },
        complete: () => {
            console.log('subscription complete')
            onComplete && onComplete()
        }
    })

    return wsClient
}

export interface SubscribeVoucherOptions {
    profile: ProfileDetail
    onMessage?: (res: SubscriptionVoucherResponse) => void
    onError?: (error: Error) => void
    onComplete?: () => void
}

export const subscriptingVoucher = ({onMessage, onError, onComplete, profile}: SubscribeVoucherOptions) => {
    const now = new Date().toISOString()

    wsClient.subscribe({
        query: SUBSCRIPTION_VOUCHER_SCHEMES.loc!.source.body,
        variables: {
            profile_id: profile.id,
            addresses: [profile.email || '', profile.address || ''],
            now
        }
    }, {
        next: (data) => {
            onMessage && onMessage(data.data as unknown as SubscriptionVoucherResponse)
        },
        error: (error) => {
            console.error(error)
            onError && onError(error as Error)
        },
        complete: () => {
            console.log('subscription complete')
            onComplete && onComplete()
        }
    })

    return wsClient
}