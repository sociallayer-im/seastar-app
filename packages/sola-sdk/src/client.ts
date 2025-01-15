import { ApolloClient, InMemoryCache} from '@apollo/client'
import {PROD_NETWORK_CONFIG, TEST_NETWORK_CONFIG} from './constants'


export type ClientMode = 'test' | 'prod'

export interface GqlClientConfigType {
    clientMode: ClientMode,
    enableCache: boolean
}

class ClientManager {
    private config: GqlClientConfigType = {clientMode: "prod", enableCache: false}

    private static instance: ClientManager

    private constructor() {}

    public static getInstance(): ClientManager {
        if (!ClientManager.instance) {
            ClientManager.instance = new ClientManager()
        }
        return ClientManager.instance
    }


    public getConfig() {
        const config = ClientManager.instance.config
        return {
            ...config,
            ...(config.clientMode === 'test' ? TEST_NETWORK_CONFIG : PROD_NETWORK_CONFIG)
        }

    }

    public setConfig(config: Partial<GqlClientConfigType>) {
        ClientManager.instance.config = {...ClientManager.instance.config, ...config}
        return ClientManager.instance.getConfig()
    }

    public getGqlClient() {
        const config = ClientManager.instance.getConfig()
        return  new ApolloClient({
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
}

export const clientManager = ClientManager.getInstance()
export const gqlClient = clientManager.getGqlClient()
export const getConfig = clientManager.getConfig
export const setConfig = clientManager.setConfig

