import { ApolloClient, InMemoryCache, ApolloLink, HttpLink} from '@apollo/client'
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
    const httpLink = new HttpLink({
        uri: config.graphql,
        fetch: function (uri, options) {
            return fetch(uri, {
                ...options ?? {},
                headers: {
                    ...options?.headers ?? {},
                },
                next: {
                    revalidate: 0
                }
            })
        }
    })

    return new ApolloClient({
        link: ApolloLink.from([httpLink]),
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
