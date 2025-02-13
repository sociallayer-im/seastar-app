import {createClient} from 'graphql-ws'
import {ClientMode, getSdkConfig} from '../client'
import {SUBSCRIPTION_ACTIVES, SUBSCRIPTION_INVITE_SCHEMES, SUBSCRIPTION_VOUCHER_SCHEMES} from './schemas'
import {SubscriptionActivityResponse, SubscriptionInviteResponse, SubscriptionVoucherResponse} from './types'
import {ProfileDetail} from '../profile'
import {Client} from 'graphql-ws/client'

export interface SubscribeInviteOptions {
    profile: ProfileDetail
    onMessage?: (res: SubscriptionInviteResponse) => void
    onError?: (error: Error) => void
    onComplete?: () => void
}

export interface SubscribeVoucherOptions {
    profile: ProfileDetail
    onMessage?: (res: SubscriptionVoucherResponse) => void
    onError?: (error: Error) => void
    onComplete?: () => void
}

export interface SubscribeActivityOptions {
    profile: ProfileDetail
    onMessage?: (res: SubscriptionActivityResponse) => void
    onError?: (error: Error) => void
    onComplete?: () => void
}

export class SubscriptionClient {
    public clientMode:ClientMode = 'prod'
    public client: Client

    constructor(clientMode:ClientMode) {
        this.clientMode = clientMode
        this.client = createClient({
            url: getSdkConfig(clientMode).graphql.replace('https', 'wss'),
        })
    }

    subscriptingInvite = ({onMessage, onError, onComplete, profile}: SubscribeInviteOptions) => {
        const now = new Date().toISOString()
        this.client.subscribe({
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

        return this.client
    }

    subscriptingVoucher = ({onMessage, onError, onComplete, profile}: SubscribeVoucherOptions) => {
        const now = new Date().toISOString()

        this.client.subscribe({
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

        return this.client
    }

    subscriptingActivity = ({onMessage, onError, onComplete, profile}: SubscribeActivityOptions) => {
        this.client.subscribe({
            query: SUBSCRIPTION_ACTIVES.loc!.source.body,
            variables: {
                profile_id: profile.id,
            }
        }, {
            next: (data) => {
                onMessage && onMessage(data.data as unknown as SubscriptionActivityResponse)
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

        return this.client
    }
}