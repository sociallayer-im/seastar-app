import crypto from 'crypto'
import {WECHAT_APP_ID, WECHAT_APP_SECRET} from './wechat'

/**
 * WeChat JS-SDK signing (wx.config) — server-side half.
 *
 * A JS-SDK signature needs a jsapi_ticket, which needs an access_token,
 * both of which WeChat rate-limits per app (access_token especially: each
 * fresh fetch consumes part of a small daily quota) and both of which are
 * valid for ~7200s — so they're cached in module scope for the life of this
 * server process rather than re-fetched per request. This process is a
 * single long-lived Node server (Nomad/Docker, not serverless), so a
 * module-level cache is durable enough; it would need moving to a shared
 * store (Rails.cache-style) only if this ever ran across multiple
 * replicas fetching independently.
 *
 * Docs: https://developers.weixin.qq.com/doc/service/guide/h5/jssdk.html
 */

interface Cached {
    value: string
    expiresAt: number
}

let cachedAccessToken: Cached | null = null
let cachedJsApiTicket: Cached | null = null

// WeChat's own expiry is 7200s; refreshing 200s early avoids a request
// landing exactly as the token expires mid-flight.
const REFRESH_SLACK_SECONDS = 200

async function getAccessToken(): Promise<string> {
    if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) return cachedAccessToken.value

    const params = new URLSearchParams({
        grant_type: 'client_credential',
        appid: WECHAT_APP_ID!,
        secret: WECHAT_APP_SECRET!
    })
    const res = await fetch(`https://api.weixin.qq.com/cgi-bin/token?${params}`, {cache: 'no-store'})
    const data = await res.json().catch(() => ({}))
    if (!data.access_token) {
        throw new Error(`wechat access_token error: ${JSON.stringify({errcode: data.errcode, errmsg: data.errmsg})}`)
    }

    cachedAccessToken = {value: data.access_token, expiresAt: Date.now() + (data.expires_in - REFRESH_SLACK_SECONDS) * 1000}
    return cachedAccessToken.value
}

async function getJsApiTicket(): Promise<string> {
    if (cachedJsApiTicket && cachedJsApiTicket.expiresAt > Date.now()) return cachedJsApiTicket.value

    const accessToken = await getAccessToken()
    const params = new URLSearchParams({access_token: accessToken, type: 'jsapi'})
    const res = await fetch(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?${params}`, {cache: 'no-store'})
    const data = await res.json().catch(() => ({}))
    if (data.errcode !== 0) {
        throw new Error(`wechat jsapi_ticket error: ${JSON.stringify({errcode: data.errcode, errmsg: data.errmsg})}`)
    }

    cachedJsApiTicket = {value: data.ticket, expiresAt: Date.now() + (data.expires_in - REFRESH_SLACK_SECONDS) * 1000}
    return cachedJsApiTicket.value
}

/**
 * Signs one page URL for wx.config. Per WeChat's spec the four fields must
 * be lowercase-key-sorted before hashing — jsapi_ticket/noncestr/timestamp/url
 * already sorts that way, so no explicit sort step is needed here, but don't
 * reorder these without checking that stays true.
 *
 * `url` must be exactly the page URL as the browser's address bar shows it
 * (no # fragment) — a mismatch (e.g. signing the request URL behind a proxy
 * instead of the public one) fails verification with no useful error beyond
 * "invalid signature" client-side.
 */
export async function signJsApiUrl(url: string) {
    const ticket = await getJsApiTicket()
    const nonceStr = crypto.randomBytes(8).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const raw = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
    const signature = crypto.createHash('sha1').update(raw).digest('hex')
    return {appId: WECHAT_APP_ID!, timestamp, nonceStr, signature}
}
