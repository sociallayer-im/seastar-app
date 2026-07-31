import {NextRequest, NextResponse} from 'next/server'
import {getProfileDetailByAuth, trustedSignIn} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {AUTH_FIELD, authCookieDomain, sanitizeReturnTarget} from '@/utils'
import {STATE_COOKIE, exchangeCode, requestOrigin, wechatConfigured} from '../wechat'

/**
 * Where WeChat sends the user back with `?code=&state=`.
 *
 * Everything sensitive happens here, server-side: the code is redeemed with the
 * app secret, and the resulting identity is exchanged for a session through
 * NEXT_TOKEN — a shared secret that mints a session for ANY identity handed to
 * it, so it must never reach the browser. Nothing the caller supplies is
 * trusted as an identity; only what WeChat returns for the code is.
 */
export async function GET(req: NextRequest) {
    const nextToken = process.env.NEXT_TOKEN
    if (!wechatConfigured() || !nextToken) {
        console.error('wechat/callback: WeChat sign-in is not configured')
        return failure(req, 'wechat_unavailable')
    }

    const code = req.nextUrl.searchParams.get('code')
    const state = req.nextUrl.searchParams.get('state')
    const expected = req.cookies.get(STATE_COOKIE)?.value

    // A user who declines the consent screen comes back with no code.
    if (!code) return failure(req, 'wechat_cancelled')
    if (!state || !expected || state !== expected) {
        console.error('wechat/callback: state mismatch')
        return failure(req, 'wechat_state')
    }

    const identity = await exchangeCode(code)
    if (!identity) return failure(req, 'wechat_failed')

    let token: string
    try {
        const result = await trustedSignIn({
            params: {
                wechatOpenid: identity.openid,
                wechatUnionid: identity.unionid,
                nextToken
            },
            clientMode: CLIENT_MODE
        })
        token = result.token
    } catch (e: unknown) {
        // Not echoed to the browser: this path handles a shared secret and an
        // upstream response, neither of which should shape a readable error.
        console.error('wechat/callback: trusted sign-in failed', e)
        return failure(req, 'wechat_failed')
    }

    // A WeChat-first account has no username until it registers one — the same
    // fork clientCheckUserLoggedInAndRedirect takes for the other providers.
    const profile = await getProfileDetailByAuth({params: {authToken: token}, clientMode: CLIENT_MODE})

    // Everything host-derived comes from the FORWARDED origin, never
    // req.nextUrl / the Host header: behind Traefik those are the container's
    // own localhost:3000, so the redirect went to https://localhost:3000/...
    // and the cookie domain was computed from "localhost".
    const origin = requestOrigin(req)
    const host = new URL(origin).hostname
    const target = profile && !profile.name
        ? '/register'
        : sanitizeReturnTarget(req.cookies.get('return')?.value, host)

    const response = NextResponse.redirect(new URL(target, origin))
    // Deliberately NOT httpOnly: this is the same cookie setAuth() writes from
    // the browser, and client code reads it back with getAuth(). Scoped to the
    // registrable parent domain for the same reason setAuth is.
    response.cookies.set(AUTH_FIELD, token, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        domain: authCookieDomain(host),
        maxAge: 365 * 24 * 60 * 60
    })
    response.cookies.delete(STATE_COOKIE)
    return response
}

/** Back to the sign-in screen with a reason the page can show. */
const failure = (req: NextRequest, reason: string) => {
    // requestOrigin, not req.nextUrl.origin — see above.
    const response = NextResponse.redirect(new URL(`/signin?error=${reason}`, requestOrigin(req)))
    response.cookies.delete(STATE_COOKIE)
    return response
}
