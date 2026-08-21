import {NextRequest} from 'next/server'

/**
 * WeChat 服务号 网页授权 (OAuth2) — server-side half.
 *
 * Only ever imported by route handlers. WECHAT_APP_SECRET is deliberately NOT a
 * NEXT_PUBLIC_ variable: it is the credential that turns an authorization code
 * into a user identity, and anything NEXT_PUBLIC_ is inlined into the browser
 * bundle at build time.
 *
 * Docs: https://developers.weixin.qq.com/doc/service/guide/h5/auth.html
 */

export const WECHAT_APP_ID = process.env.WECHAT_APP_ID
export const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET

export const wechatConfigured = () => !!WECHAT_APP_ID && !!WECHAT_APP_SECRET

/** Cookie holding the one-time `state`, checked on the way back (CSRF). */
export const STATE_COOKIE = 'wechat_oauth_state'

/**
 * Where to send the buyer back after the openid backfill. A separate cookie
 * from the sign-in flow's `return`: this leg happens to someone already signed
 * in and mid-checkout, and must not disturb wherever they were headed after
 * login.
 */
export const BIND_RETURN_COOKIE = 'wechat_bind_return'

/**
 * The public origin of this request — what WeChat must redirect back to, and
 * what every redirect and cookie domain in this flow has to be built from.
 *
 * The forwarded headers are the ONLY correct source here. Behind Traefik,
 * `req.url` / `req.nextUrl` / the Host header are the container's own
 * `localhost:3000`; using them sent the post-login redirect to
 * `https://localhost:3000/register` and derived the cookie domain from
 * "localhost". WeChat also only accepts a redirect_uri under the 网页授权域名
 * verified in the 公众号 console (www.juluo.xyz), so a wrong host fails with
 * "redirect_uri 参数错误" rather than anything diagnosable.
 *
 * The protocol falls back to the request's own rather than a hardcoded https,
 * so `next dev` over http keeps working.
 */
export const requestOrigin = (req: NextRequest): string => {
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? ''
    const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '')
    return `${proto}://${host}`
}

/**
 * snsapi_userinfo, not snsapi_base. base is silent (no consent screen) but
 * returns only an openid, and openid is per-appid: keying accounts on it alone
 * would split the same person across a future mini program or desktop QR login
 * with nothing to merge them by. userinfo returns the unionid, which is stable
 * across every app under our 开放平台 account.
 */
export const authorizeUrl = (
    redirectUri: string,
    state: string,
    // snsapi_base is right for exactly one case: the payment openid backfill,
    // where the person is already signed in, the account is already identified,
    // and the only missing fact is the openid. Showing a consent screen there
    // would interrupt a checkout to ask permission for something already
    // granted at sign-in.
    scope: 'snsapi_userinfo' | 'snsapi_base' = 'snsapi_userinfo'
): string => {
    const params = new URLSearchParams({
        appid: WECHAT_APP_ID!,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope,
        state
    })
    // The #wechat_redirect fragment is required — without it the WeChat client
    // refuses to open the page.
    return `https://open.weixin.qq.com/connect/oauth2/authorize?${params}#wechat_redirect`
}

export interface WechatIdentity {
    openid: string
    unionid?: string
    /** From /sns/userinfo — best-effort; absent if that follow-up call failed. */
    nickname?: string
    avatarUrl?: string
}

/**
 * Redeems the authorization code. The code is single-use and expires in five
 * minutes; WeChat answers 200 with an `errcode` body on failure rather than an
 * HTTP error status, so the body has to be inspected either way.
 */
export const exchangeCode = async (code: string): Promise<WechatIdentity | null> => {
    const params = new URLSearchParams({
        appid: WECHAT_APP_ID!,
        secret: WECHAT_APP_SECRET!,
        code,
        grant_type: 'authorization_code'
    })

    const res = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?${params}`, {
        cache: 'no-store'
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || data.errcode || !data.openid) {
        console.error('wechat: code exchange failed', {errcode: data.errcode, errmsg: data.errmsg})
        return null
    }

    // A 快照页 user has no real WeChat account behind the openid, so there is
    // nothing durable to attach a session to.
    if (data.is_snapshotuser) {
        console.error('wechat: snapshot user rejected')
        return null
    }

    const identity: WechatIdentity = {openid: String(data.openid), unionid: data.unionid ? String(data.unionid) : undefined}

    // snsapi_userinfo (unlike snsapi_base) entitles this follow-up call for
    // nickname/avatar — and only that scope's consent screen lets WeChat
    // actually answer it, so skip the call entirely under snsapi_base (the
    // silent payment openid-backfill leg) rather than make a request that
    // would just fail every time. Best-effort either way: openid/unionid
    // alone are enough to identify the account; nickname/avatar only ever
    // backfill a blank field (see AuthController#bind_wechat).
    if (String(data.scope ?? '').includes('userinfo')) {
        const profile = await fetchUserInfo(data.access_token, identity.openid)
        if (profile) {
            identity.nickname = profile.nickname
            identity.avatarUrl = profile.avatarUrl
        }
    }

    return identity
}

const fetchUserInfo = async (accessToken: string, openid: string): Promise<{ nickname?: string, avatarUrl?: string } | null> => {
    try {
        const params = new URLSearchParams({access_token: accessToken, openid, lang: 'zh_CN'})
        const res = await fetch(`https://api.weixin.qq.com/sns/userinfo?${params}`, {cache: 'no-store'})
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data.errcode) {
            // snsapi_base carries no consent for this — an errcode here is
            // expected on that scope, not necessarily a real failure.
            console.error('wechat: userinfo fetch failed', {errcode: data.errcode, errmsg: data.errmsg})
            return null
        }
        return {
            nickname: data.nickname ? String(data.nickname) : undefined,
            avatarUrl: data.headimgurl ? String(data.headimgurl) : undefined
        }
    } catch (e) {
        console.error('wechat: userinfo fetch threw', e)
        return null
    }
}
