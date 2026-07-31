import {request} from '../request'
import {ClientMode} from '../client'
import {SolaSdkFunctionParams} from '../types'
import {ProfileDetail} from '../profile/types'

/**
 * What soon's /auth/* endpoints hand back on a successful sign-in: the JWT plus
 * just enough of the user to decide where to send them next. `name` is null for
 * an account that hasn't picked a username yet — that's the signal to route
 * through /register (see also getCurrProfile, which deliberately reports a
 * nameless account as signed-out).
 */
export interface AuthResult {
    token: string
    user: {id: string, email: string | null, name: string | null}
}

/** Sends a one-time code. An unknown address signs UP on verify. */
export const requestEmailCode = async ({params, clientMode}: SolaSdkFunctionParams<{
    email: string,
    /**
     * Codes are context-scoped by the backend so a bind code can never be
     * replayed as a login code (or vice versa). Omit for sign-in.
     */
    context?: 'bind_email'
}>): Promise<void> => {
    await request('/auth/request_code', {
        method: 'POST',
        clientMode,
        body: {email: params.email, context: params.context}
    })
}

/** Verifies a sign-in code, creating the account on first use. */
export const verifyEmailCode = async ({params, clientMode}: SolaSdkFunctionParams<{
    email: string,
    code: string
}>) => {
    return await request<AuthResult>('/auth/verify_code', {
        method: 'POST',
        clientMode,
        body: {email: params.email, code: params.code}
    })
}

/**
 * Mints a single-use SIWE nonce. The server remembers it (as an AuthCode with a
 * 15-minute TTL) and rejects any signed message carrying a nonce it didn't mint
 * or has already redeemed — so a captured signature can't be replayed.
 */
export const getSiweNonce = async ({clientMode}: {clientMode: ClientMode}) => {
    const {nonce} = await request<{nonce: string}>('/auth/nonce', {clientMode, noCache: true})
    return nonce
}

/**
 * Builds the EIP-4361 message the wallet will display and sign.
 *
 * The exact line order and wording matter: the backend parses this with
 * siwe-rb, which implements the spec's grammar strictly. `domain` is checked
 * against the backend's ALLOWED_SIWE_DOMAINS allowlist — a host that isn't on
 * that list is rejected even with a perfectly valid signature, which is what
 * stops a lookalike site from harvesting signatures that work here.
 */
export const buildSiweMessage = (params: {
    domain: string,
    origin: string,
    address: string,
    nonce: string,
    issuedAt?: string
}) => {
    return `${params.domain} wants you to sign in with your Ethereum account:
${params.address}

Sign in with Ethereum to the app.

URI: ${params.origin}
Version: 1
Chain ID: 1
Nonce: ${params.nonce}
Issued At: ${params.issuedAt || new Date().toISOString()}`
}

/**
 * Sign-In with Ethereum. Send the raw message exactly as it was signed —
 * re-serializing it changes the bytes and the signature no longer verifies.
 */
export const signInWithWallet = async ({params, clientMode}: SolaSdkFunctionParams<{
    message: string,
    signature: string
}>) => {
    return await request<AuthResult>('/auth/verify_wallet', {
        method: 'POST',
        clientMode,
        body: {message: params.message, signature: params.signature}
    })
}

/**
 * Attaches a code-verified email to a wallet-first account. The email is the
 * login identity, so the backend only allows it once and never to an address
 * that already belongs to someone else.
 */
export const bindEmail = async ({params, clientMode}: SolaSdkFunctionParams<{
    email: string,
    code: string,
    authToken: string
}>) => {
    return await request<ProfileDetail>('/auth/bind_email', {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {email: params.email, code: params.code}
    })
}

/**
 * Exchanges a server-verified identity for a session, gated by the NEXT_TOKEN
 * shared secret. Exactly one identity is expected: an email (Google), or a
 * WeChat openid/unionid pair (CN 网页授权).
 *
 * SERVER-SIDE ONLY. NEXT_TOKEN mints a session for ANY identity it is given, so
 * it must never reach the browser — call this from a route handler that has
 * already verified the identity itself (see app/api/google-signin and
 * app/api/wechat/callback).
 */
export const trustedSignIn = async ({params, clientMode}: SolaSdkFunctionParams<{
    email?: string,
    wechatOpenid?: string,
    wechatUnionid?: string,
    nextToken: string
}>) => {
    return await request<AuthResult>('/auth/trusted_signin', {
        method: 'POST',
        clientMode,
        body: {
            email: params.email,
            wechat_openid: params.wechatOpenid,
            wechat_unionid: params.wechatUnionid,
            next_token: params.nextToken
        }
    })
}
