import { ApolloClient, InMemoryCache} from '@apollo/client'
import {PROD_NETWORK_CONFIG, DEV_NETWORK_CONFIG} from './constants'


export type ClientMode = 'dev' | 'prod'

export interface GqlClientConfigType {
    clientMode: ClientMode,
    enableCache: boolean
}

let config: GqlClientConfigType = {clientMode: "prod", enableCache: false}

export const setSdkConfig = (newConfig: Partial<GqlClientConfigType>) => {
    config = {...config, ...newConfig}
    return config
}

export const getSdkConfig = () => {
    return {
        ...config,
        ...(config.clientMode === 'dev' ? DEV_NETWORK_CONFIG : PROD_NETWORK_CONFIG)
    }
}

export const getGqlClient = () => {
    const config = getSdkConfig()
    return new ApolloClient({
        uri: config.graphql,
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: config.enableCache ? 'cache-first' : 'no-cache'
            },
            query: {
                fetchPolicy: config.enableCache ? 'cache-first' : 'no-cache'
            }
        }
    })
}
