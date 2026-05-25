import {ClientMode} from '@sola/sdk'

export const CLIENT_MODE = process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode

export const SOLA_APP_SUBDOMAINS =  ['app', 'www', 'seastar-dev', 'auth', 'beta', 'auth-beta', 'dashboard']