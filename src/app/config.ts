import {ClientMode} from '@sola/sdk'

export const CLIENT_MODE = process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode

// Hosts where this app serves itself. Anything NOT listed here is read by
// getGroupSubdomain as a group's vanity domain, so its '/' renders that group's
// event home — and 404s when no such group exists. Add a subdomain here before
// pointing a new app host at this deployment.
export const SOLA_APP_SUBDOMAINS =  ['app', 'sola', 'www', 'seastar-dev', 'auth', 'beta', 'auth-beta', 'dashboard', 'appb']

// Length of the emailed sign-in / bind code. Must match what soon generates
// (AuthController#generated_code) — the input's maxLength and the submit
// button's enable threshold both key off it, so a mismatch either truncates a
// valid code or leaves Confirm permanently disabled.
export const CODE_LENGTH = 6

// Subdomains that used to be the standalone auth app. This app now serves them,
// and middleware rewrites their '/' to /signin so the sign-in URLs already in
// circulation keep landing on the sign-in screen. Must stay a subset of
// SOLA_APP_SUBDOMAINS, or getGroupSubdomain would read "auth" as a group handle.
export const AUTH_HOST_SUBDOMAINS = ['auth', 'auth-beta']

// The one host this deployment wants to be reached on. Everything in
// CANONICAL_REDIRECT_HOSTS 308s to it, path and query preserved, and it is the
// origin stamped into absolute Open Graph URLs.
//
// Both are env-driven and both default to empty, because the two deployments
// disagree: SG serves the bare apex (sola.day) and folds app./www. into it,
// while CN's canonical host IS www.juluo.xyz and must not redirect anywhere.
// Unset means "no host normalisation", which is also what local dev wants —
// a hardcoded rule here would bounce localhost:4001 to production.
export const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || ''

// Hosts that should 308 to CANONICAL_HOST. Deliberately an explicit list rather
// than "anything that isn't canonical": auth.sola.day must keep answering on
// its own name (middleware rewrites its '/' to /signin), and every group
// subdomain — infinitacity.sola.day and any future one — renders in place. A
// catch-all would silently break both.
export const CANONICAL_REDIRECT_HOSTS = (process.env.NEXT_PUBLIC_CANONICAL_REDIRECT_HOSTS || '')
    .split(',').map(h => h.trim().toLowerCase()).filter(Boolean)

// Absolute origin for Open Graph / share URLs, which cannot be relative. Falls
// back to the canonical host so a deployment only has to set one variable.
export const CANONICAL_ORIGIN = process.env.NEXT_PUBLIC_CANONICAL_ORIGIN
    || (CANONICAL_HOST ? `https://${CANONICAL_HOST}` : 'https://sola.day')

// Third-party sign-in (Google) is only wired where an OAuth client exists and
// the origin is registered in the Google console.
export const THIRD_PARTY_LOGIN = process.env.NEXT_PUBLIC_THIRD_PARTY_LOGIN === 'true'

// WeChat 服务号 sign-in, CN only: it needs an appid/secret and a 网页授权域名
// verified in the 公众号 console, none of which exist for sola.day. Opt-in for
// that reason — a deployment without the configuration should not show it.
// The button additionally only renders inside the WeChat browser; see
// signin/page.tsx.
export const WECHAT_LOGIN = process.env.NEXT_PUBLIC_WECHAT_LOGIN === 'true'

// SMS sign-in, CN only and +86 only: the Aliyun 签名 and 模板 belong to a
// domestic company and can only deliver to mainland numbers. Opt-in for the
// same reason as WECHAT_LOGIN — soon's own PHONE_LOGIN_ENABLED is
// authoritative (the endpoints 404 without it) and this only hides UI.
//
// It also switches on the REQUIRED bind-phone step for WeChat accounts; see
// onboardingTarget. Turning it off leaves that step out entirely rather than
// stranding people on a page whose endpoints don't exist.
export const PHONE_LOGIN = process.env.NEXT_PUBLIC_PHONE_LOGIN === 'true'

// Stripe card payments are SG-only (soon design/PAYMENTS_PLAN.md decision
// #13): set in .env.production, absent in .env.cn.production. The backend's
// STRIPE_ENABLED is authoritative — this flag only hides UI.
export const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true'

// Discussion boards. Opt-in like PHONE_LOGIN, and for the same reason: soon's
// own DISCUSSION_ENABLED is authoritative — every discussion endpoint 404s
// without it — and this flag only decides whether the UI is drawn. A group
// additionally has to switch its own `discussion_enabled` on, so both this and
// the group's flag must be true before the tab appears.
export const DISCUSSION = process.env.NEXT_PUBLIC_DISCUSSION === 'true'

// WeChat Pay is the mirror image: CN only, set in .env.cn.production and
// absent from .env.production. The backend's WECHAT_PAY_ENABLED plus an
// actually-installed merchant are authoritative; this only hides UI.
export const WECHAT_PAY_ENABLED = process.env.NEXT_PUBLIC_WECHAT_PAY_ENABLED === 'true'

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
//
// WeChat Pay must be in this disjunction: CN has crypto and Stripe both off,
// so leaving it out hides every price control on the deployment the rail was
// built for, and the symptom is "WeChat Pay does nothing" rather than
// anything pointing here.
export const PAYMENTS_ENABLED = CRYPTO_PAYMENT_ENABLED || STRIPE_ENABLED || WECHAT_PAY_ENABLED