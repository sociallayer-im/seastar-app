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

// The next two are opt-OUT, unlike the flags above. Both features have always
// been unconditionally on, and .env.production is gitignored — an opt-in flag
// would make them vanish from SG the first time someone builds without that
// file. Only a deployment that explicitly writes "false" (CN) loses them.

// Sign-In with Ethereum. Off on CN: wallet software is largely unreachable
// there and the flow ends at a wallet that never appears.
export const WALLET_LOGIN = process.env.NEXT_PUBLIC_WALLET_LOGIN !== 'false'

// On-chain (PayHub/EVM) ticket payments. Off on CN.
export const CRYPTO_PAYMENT_ENABLED = process.env.NEXT_PUBLIC_CRYPTO_PAYMENT_ENABLED !== 'false'

// Whether any payment rail exists at all. With none, a ticket can only be free,
// so the price UI has nothing to offer.
export const PAYMENTS_ENABLED = CRYPTO_PAYMENT_ENABLED || STRIPE_ENABLED