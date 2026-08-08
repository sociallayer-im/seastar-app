import {WechatPayParams} from '@sola/sdk'

/**
 * Browser half of WeChat Pay JSAPI.
 *
 * The payment sheet is opened by WeixinJSBridge, an object the WeChat client
 * injects into pages it renders itself. Outside that client it does not exist,
 * which is why JSAPI is unavailable anywhere but the in-app browser.
 */

/**
 * True inside the WeChat client's browser. UA sniffing is the only detection
 * WeChat documents; the bridge is injected asynchronously, so its presence at
 * any given moment is not a reliable substitute.
 */
export const isWechatBrowser = () =>
    typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)

interface WeixinJSBridge {
    invoke(method: string, params: Record<string, string>, callback: (res: {err_msg?: string}) => void): void
}

/**
 * The bridge is injected after the page starts running, so a page that loads
 * fast enough finds it missing. WeChat fires WeixinJSBridgeReady exactly once
 * when it lands — and only if it has not already, hence the check first.
 */
const bridgeReady = (timeoutMs = 5000): Promise<WeixinJSBridge | null> =>
    new Promise(resolve => {
        const existing = (window as unknown as {WeixinJSBridge?: WeixinJSBridge}).WeixinJSBridge
        if (existing) return resolve(existing)

        const timer = setTimeout(() => resolve(null), timeoutMs)
        document.addEventListener('WeixinJSBridgeReady', () => {
            clearTimeout(timer)
            resolve((window as unknown as {WeixinJSBridge?: WeixinJSBridge}).WeixinJSBridge ?? null)
        }, {once: true})
    })

export type WechatPayOutcome = 'ok' | 'cancel' | 'fail' | 'unavailable'

/**
 * Opens the payment sheet and reports what the user did with it.
 *
 * The result is for the UI ONLY. err_msg comes from the browser and can be
 * anything a determined buyer wants it to be, and even honestly reported it
 * races the server: 'ok' means the sheet closed successfully, not that the
 * money has settled. Confirmation comes exclusively from the callback (or the
 * sweeper) reaching soon — so 'ok' should lead to polling, never to showing a
 * ticket.
 *
 * The converse also matters: 'fail' does not prove nothing was paid, so it
 * must not cancel the order client-side either. Let it expire or settle.
 */
export const invokeWechatPay = async (params: WechatPayParams): Promise<WechatPayOutcome> => {
    const bridge = await bridgeReady()
    if (!bridge) return 'unavailable'

    return new Promise<WechatPayOutcome>(resolve => {
        bridge.invoke('getBrandWCPayRequest', {...params}, res => {
            switch (res?.err_msg) {
                case 'get_brand_wcpay_request:ok':
                    return resolve('ok')
                case 'get_brand_wcpay_request:cancel':
                    return resolve('cancel')
                default:
                    return resolve('fail')
            }
        })
    })
}
