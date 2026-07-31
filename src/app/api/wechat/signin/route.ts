import {NextRequest, NextResponse} from 'next/server'
import {STATE_COOKIE, authorizeUrl, requestOrigin, wechatConfigured} from '../wechat'

/**
 * Entry point for WeChat sign-in: mints a `state`, remembers it in a cookie,
 * and hands the browser to WeChat's consent page.
 *
 * A redirect rather than a fetch, because 网页授权 is a full-page flow — there is
 * no popup/token variant like Google's.
 */
export async function GET(req: NextRequest) {
    if (!wechatConfigured()) {
        console.error('wechat/signin: WECHAT_APP_ID / WECHAT_APP_SECRET are not configured')
        return NextResponse.redirect(new URL('/signin?error=wechat_unavailable', req.url))
    }

    // Random, single-use, and compared on the way back. Without it any page
    // could feed a victim's browser an attacker's authorization code and land
    // them in the attacker's account.
    const state = crypto.randomUUID()
    const redirectUri = `${requestOrigin(req)}/api/wechat/callback`

    const response = NextResponse.redirect(authorizeUrl(redirectUri, state))
    response.cookies.set(STATE_COOKIE, state, {
        httpOnly: true,
        secure: true,
        // 'lax' and not 'strict': the browser arrives here from weixin.qq.com,
        // and a strict cookie would not be sent on that cross-site navigation.
        sameSite: 'lax',
        path: '/',
        maxAge: 600
    })
    return response
}
