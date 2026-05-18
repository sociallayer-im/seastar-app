import {PROD_NETWORK_CONFIG, DEV_NETWORK_CONFIG} from './constants'

export type ClientMode = 'dev' | 'prod'

export const getSdkConfig = (clientMode?: ClientMode) => {
    return clientMode === 'dev' ? DEV_NETWORK_CONFIG : PROD_NETWORK_CONFIG
}
