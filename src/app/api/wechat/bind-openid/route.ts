import {NextRequest, NextResponse} from 'next/server'
import {sanitizeReturnTarget} from '@/utils'
import {BIND_RETURN_COOKIE, STATE_COOKIE, authorizeUrl, requestOrigin, wechatConfigured} from '../wechat'

/**
 * Backfills the payer's WeChat openid for an account that has none.
 *
 * WeChat Pay's JSAPI cannot place an order without `payer.openid`, and openid
 * is issued per appid by 网页授权 — so a buyer who signed in by email simply has
 * no way to pay until they pass through here once. The frontend sends them
 * when wechat_prepay answers OPENID_REQUIRED.
 *
 * snsapi_base rather than snsapi_userinfo: this is not a sign-in, the account
 * is already known, and the only missing fact is the openid. There is no
 * consent screen, so from the buyer's side checkout blinks and continues.
 *
 * Note the account is identified by the auth cookie on the way back, never by
 * anything in the query string — see the callback.
 */
export async function GET(req: NextRequest) {
    const origin = requestOrigin(req)
    const host = new URL(origin).hostname
    // Where checkout was; sanitized on the way in so the cookie can never hold
    // an off-site URL to be redirected to later.
    const target = sanitizeReturnTarget(req.nextUrl.searchParams.get('return'), host)

    if (!wechatConfigured()) {
        console.error('wechat/bind-openid: WECHAT_APP_ID / WECHAT_APP_SECRET are not configured')
        return NextResponse.redirect(new URL(target, origin))
    }

    const state = crypto.randomUUID()
    // A path of its own, so a code minted here can never be replayed into the
    // sign-in callback (which would mint a session instead of a binding).
    const redirectUri = `${origin}/api/wechat/bind-openid/callback`

    const response = NextResponse.redirect(authorizeUrl(redirectUri, state, 'snsapi_base'))
    const cookie = {
        httpOnly: true,
        secure: true,
        // 'lax', not 'strict': the browser arrives back from weixin.qq.com and
        // a strict cookie would not be sent on that cross-site navigation.
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 600
    }
    response.cookies.set(STATE_COOKIE, state, cookie)
    response.cookies.set(BIND_RETURN_COOKIE, target, cookie)
    return response
}
