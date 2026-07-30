import {ClientMode} from '@sola/sdk'

export const CLIENT_MODE = process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode

export const SOLA_APP_SUBDOMAINS =  ['app', 'www', 'seastar-dev', 'auth', 'beta', 'auth-beta', 'dashboard']

// Subdomains that used to be the standalone auth app. This app now serves them,
// and middleware rewrites their '/' to /signin so the sign-in URLs already in
// circulation keep landing on the sign-in screen. Must stay a subset of
// SOLA_APP_SUBDOMAINS, or getGroupSubdomain would read "auth" as a group handle.
export const AUTH_HOST_SUBDOMAINS = ['auth', 'auth-beta']

// Third-party sign-in (Google) is only wired where an OAuth client exists and
// the origin is registered in the Google console.
export const THIRD_PARTY_LOGIN = process.env.NEXT_PUBLIC_THIRD_PARTY_LOGIN === 'true'

// Stripe card payments are SG-only (soon design/PAYMENTS_PLAN.md decision
// #13): set in .env.production, absent in .env.cn.production. The backend's
// STRIPE_ENABLED is authoritative — this flag only hides UI.
export const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true'