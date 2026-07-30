import {ClientMode} from '@sola/sdk'

export const CLIENT_MODE = process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode

export const SOLA_APP_SUBDOMAINS =  ['app', 'www', 'seastar-dev', 'auth', 'beta', 'auth-beta', 'dashboard']

// Stripe card payments are SG-only (soon design/PAYMENTS_PLAN.md decision
// #13): set in .env.production, absent in .env.cn.production. The backend's
// STRIPE_ENABLED is authoritative — this flag only hides UI.
export const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true'