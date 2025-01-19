import {createClient} from 'graphql-ws'
import {getSdkConfig} from '../client'
import {SUBSCRIPTION_SCHEMES} from './schemas'
import {SubscriptionResponse} from './types'
import {ProfileDetail} from '../profile'

export const wsClient = createClient({
    url: getSdkConfig().graphql.replace('https', 'wss'),
})

export interface SubscribeOptions {
    profile: ProfileDetail
    onMessage?: (res: SubscriptionResponse) => void
    onError?: (error: Error) => void
    onComplete?: () => void
}

export const subscripting = ({onMessage, onError, onComplete, profile}: SubscribeOptions) => {
    const now = new Date().toISOString()

    wsClient.subscribe({
        query: SUBSCRIPTION_SCHEMES.loc!.source.body,
        variables: {
            profile_id: profile.id,
            addresses: [profile.email || '', profile.address || ''],
            now
        }
    }, {
        next: (data) => {
            onMessage && onMessage(data.data as unknown as SubscriptionResponse)
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