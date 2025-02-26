import { ApolloClient, InMemoryCache, ApolloLink, HttpLink} from '@apollo/client'
import {PROD_NETWORK_CONFIG, DEV_NETWORK_CONFIG} from './constants'


export type ClientMode = 'dev' | 'prod'

export const getSdkConfig = (clientMode?: ClientMode) => {
    return clientMode === 'dev' ? DEV_NETWORK_CONFIG : PROD_NETWORK_CONFIG
}

export const getGqlClient = (clientMode?: ClientMode, enableCache?:boolean) => {
    const httpLink = new HttpLink({
        uri: clientMode === 'dev' ? DEV_NETWORK_CONFIG.graphql : PROD_NETWORK_CONFIG.graphql,
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
                fetchPolicy: enableCache ? 'cache-first' : 'no-cache'
            },
            query: {
                fetchPolicy: enableCache ? 'cache-first' : 'no-cache'
            }
        }
    })
}
