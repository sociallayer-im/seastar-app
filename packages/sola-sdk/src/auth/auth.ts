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
/**
 * Result of binding an address that already belonged to another account: the
 * two were merged, and the caller is now signed in AS that other account. The
 * token replaces the one that was sent — the account it authenticated is gone.
 */
export interface BindEmailMerged {
    merged: true
    token: string
    user: {id: string, email: string | null, name: string | null}
}

export type BindEmailResult = ProfileDetail | BindEmailMerged

export const isBindEmailMerged = (result: BindEmailResult): result is BindEmailMerged =>
    (result as BindEmailMerged).merged === true

/**
 * Attaches a verified email to an account that signed in by wallet or WeChat.
 *
 * If the address already has an account, the backend MERGES this one into it
 * rather than failing — but only while this account is still unregistered
 * (no username yet). Check the result with isBindEmailMerged: on a merge you
 * must store the returned token, because the session you sent is now invalid.
 */
export const bindEmail = async ({params, clientMode}: SolaSdkFunctionParams<{
    email: string,
    code: string,
    authToken: string
}>) => {
    return await request<BindEmailResult>('/auth/bind_email', {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {email: params.email, code: params.code}
    })
}

/* --- SMS sign-in (CN only) ------------------------------------------------
 *
 * All three 404 unless the backend has PHONE_LOGIN_ENABLED=true, which only CN
 * sets: the Aliyun 签名 and 模板 are a domestic company's and can only deliver
 * to +86 numbers. Gate the UI on NEXT_PUBLIC_PHONE_LOGIN rather than calling
 * and handling the 404.
 *
 * `phone` is sent as typed — "13800138000", "+86 138 0013 8000" and
 * "8613800138000" are all accepted and normalised server-side to one canonical
 * +86… string. Don't try to normalise it here: the backend's version is the one
 * that has to match, and doing it twice invites the two from drifting.
 */

/** Texts a one-time code. An unknown number signs UP on verify. */
export const requestPhoneCode = async ({params, clientMode}: SolaSdkFunctionParams<{
    phone: string,
    /** Omit for sign-in; 'bind_phone' mints a code for the bind flow instead. */
    context?: 'bind_phone'
}>): Promise<void> => {
    await request('/auth/request_phone_code', {
        method: 'POST',
        clientMode,
        body: {phone: params.phone, context: params.context}
    })
}

/** Verifies a sign-in code, creating the account on first use. */
export const verifyPhoneCode = async ({params, clientMode}: SolaSdkFunctionParams<{
    phone: string,
    code: string
}>) => {
    return await request<AuthResult>('/auth/verify_phone_code', {
        method: 'POST',
        clientMode,
        body: {phone: params.phone, code: params.code}
    })
}

/**
 * Attaches a verified number to the account already signed in — the required
 * step after a WeChat sign-in.
 *
 * Merges on the same terms as bindEmail: a number that already has its own
 * account (from an earlier SMS sign-in) absorbs this one rather than failing,
 * because this step cannot be skipped and a hard error would leave the user
 * with nowhere to go. The response shape is the same one bindEmail returns —
 * check it with isBindEmailMerged, and on a merge store the returned token,
 * since the session you sent belonged to an account that no longer exists.
 */
export const bindPhone = async ({params, clientMode}: SolaSdkFunctionParams<{
    phone: string,
    code: string,
    authToken: string
}>) => {
    return await request<BindEmailResult>('/auth/bind_phone', {
        method: 'POST',
        clientMode,
        authToken: params.authToken,
        body: {phone: params.phone, code: params.code}
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
