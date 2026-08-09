import {SolaSdkFunctionParams} from '../types'
import {request} from '../request'

/**
 * WeChat Pay (backend: soon design/WECHAT_INTEGRATION.md §2).
 *
 * These endpoints exist only on deployments with WECHAT_PAY_ENABLED (CN) and
 * an installed merchant — on SG they 404, so callers should gate on
 * NEXT_PUBLIC_WECHAT_PAY_ENABLED first, exactly as with the Stripe module.
 */

/**
 * What WeixinJSBridge.invoke('getBrandWCPayRequest', …) expects, verbatim.
 * The key casing is WeChat's, not ours — renaming any of it breaks the call.
 *
 * paySign is computed server-side with the merchant private key. Nothing here
 * can be produced or altered in the browser, which is also why the bridge's
 * own success callback proves nothing and never marks an order paid.
 */
export interface WechatPayParams {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: 'RSA'
    paySign: string
}

/**
 * Places the JSAPI order for a pending WeChat ticket order.
 *
 * Throws with `code: 'OPENID_REQUIRED'` when the buyer's account carries no
 * WeChat openid — everyone who signed in by email rather than through WeChat.
 * That is recoverable, not fatal: send them through /api/wechat/bind-openid
 * (a silent snsapi_base authorize) and retry.
 */
export const createWechatPrepay = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId: string,
    authToken: string
}>) => {
    return await request<{ result: string, pay_params: WechatPayParams }>(
        '/tickets/wechat_prepay', {
            method: 'POST',
            body: {ticket_item_id: params.ticketItemId},
            authToken: params.authToken,
            clientMode
        })
}

/**
 * Attaches a WeChat identity to the signed-in account.
 *
 * Server-side only: it needs NEXT_TOKEN, which must never reach the browser,
 * and the openid is only trustworthy because the caller has just redeemed the
 * authorization code with the app secret. Called from the
 * /api/wechat/bind-openid callback route handler.
 */
export const bindWechatIdentity = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    wechatOpenid: string,
    wechatUnionid?: string,
    nextToken: string
}>) => {
    return await request<{ id: string }>('/auth/bind_wechat', {
        method: 'POST',
        body: {
            wechat_openid: params.wechatOpenid,
            wechat_unionid: params.wechatUnionid,
            next_token: params.nextToken
        },
        authToken: params.authToken,
        clientMode
    })
}
