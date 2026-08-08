import {NextRequest, NextResponse} from 'next/server'
import {bindWechatIdentity} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {AUTH_FIELD, sanitizeReturnTarget} from '@/utils'
import {BIND_RETURN_COOKIE, STATE_COOKIE, exchangeCode, requestOrigin, wechatConfigured} from '../../wechat'

/**
 * Return leg of the openid backfill.
 *
 * Unlike the sign-in callback this mints no session: the account is whoever
 * the existing auth cookie says it is, and the only thing being added is the
 * openid WeChat just confirmed. The two credentials do different jobs and both
 * are required — the cookie says WHICH account, the app-secret exchange says
 * WHAT the openid is. Neither alone would be safe: an openid accepted on the
 * cookie alone could be a stranger's, claimed by anyone who can type one.
 *
 * Always ends up back at checkout, success or failure. The buyer asked to pay,
 * not to see an error page; a failed bind simply means the next prepay attempt
 * asks again.
 */
export async function GET(req: NextRequest) {
    const origin = requestOrigin(req)
    const host = new URL(origin).hostname
    const target = sanitizeReturnTarget(req.cookies.get(BIND_RETURN_COOKIE)?.value, host)
    const done = (error?: string) => {
        const url = new URL(target, origin)
        if (error) url.searchParams.set('wechat_bind_error', error)
        const response = NextResponse.redirect(url)
        response.cookies.delete(STATE_COOKIE)
        response.cookies.delete(BIND_RETURN_COOKIE)
        return response
    }

    const nextToken = process.env.NEXT_TOKEN
    if (!wechatConfigured() || !nextToken) {
        console.error('wechat/bind-openid: not configured')
        return done('unavailable')
    }

    const code = req.nextUrl.searchParams.get('code')
    const state = req.nextUrl.searchParams.get('state')
    const expected = req.cookies.get(STATE_COOKIE)?.value
    if (!code) return done('cancelled')
    if (!state || !expected || state !== expected) {
        console.error('wechat/bind-openid: state mismatch')
        return done('state')
    }

    // Present because the buyer was signed in when they hit prepay. Absent
    // means the session went away mid-flow — there is no account to bind to.
    const authToken = req.cookies.get(AUTH_FIELD)?.value
    if (!authToken) return done('signed_out')

    const identity = await exchangeCode(code)
    if (!identity) return done('failed')

    try {
        await bindWechatIdentity({
            params: {
                authToken,
                wechatOpenid: identity.openid,
                wechatUnionid: identity.unionid,
                nextToken
            },
            clientMode: CLIENT_MODE
        })
    } catch (e: unknown) {
        // Most likely cause is a real one worth naming: this WeChat account
        // already belongs to a different account here, so the fix is to sign
        // in as that one rather than to retry.
        console.error('wechat/bind-openid: bind failed', e)
        return done('bind_failed')
    }

    return done()
}
