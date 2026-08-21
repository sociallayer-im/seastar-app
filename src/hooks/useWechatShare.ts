'use client'

import {useEffect} from 'react'
import {isWechatBrowser} from '@/utils/wechat_pay'
import {WECHAT_LOGIN} from '@/app/config'

// WeChat's own SDK script — not npm-installed, WeChat serves it directly and
// expects pages to load it from here.
const JSSDK_SRC = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'

declare global {
    interface Window {
        wx?: any
    }
}

let jssdkLoad: Promise<void> | null = null

function loadJsSdkScript(): Promise<void> {
    if (window.wx) return Promise.resolve()
    if (jssdkLoad) return jssdkLoad
    jssdkLoad = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = JSSDK_SRC
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('failed to load WeChat JS-SDK'))
        document.head.appendChild(script)
    })
    return jssdkLoad
}

export interface WechatShareData {
    title: string
    desc: string
    link: string
    imgUrl: string
}

/**
 * Configures WeChat's native "..." share sheet (Send to Chat / Moments) for
 * the current page, when opened inside WeChat's in-app browser.
 *
 * A no-op everywhere else: outside WeChat's browser there is no `wx` bridge
 * and no native share sheet to configure — the plain share-intent buttons
 * next to this cover that case instead.
 */
export default function useWechatShare(data: WechatShareData | null) {
    useEffect(() => {
        if (!data || !WECHAT_LOGIN || !isWechatBrowser()) return

        let cancelled = false
        const url = window.location.href.split('#')[0]

        ;(async () => {
            try {
                const res = await fetch(`/api/wechat/jsapi-signature?url=${encodeURIComponent(url)}`)
                if (!res.ok) return
                const {appId, timestamp, nonceStr, signature} = await res.json()
                if (cancelled) return

                await loadJsSdkScript()
                if (cancelled || !window.wx) return

                window.wx.config({
                    debug: false,
                    appId,
                    timestamp,
                    nonceStr,
                    signature,
                    jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
                })

                window.wx.ready(() => {
                    if (cancelled) return
                    window.wx.updateAppMessageShareData(data)
                    window.wx.updateTimelineShareData({title: data.title, link: data.link, imgUrl: data.imgUrl})
                })
                // wx.error fires on a bad signature (stale ticket, mismatched
                // url, wrong domain) — surfaced to the console rather than the
                // user, since the plain share buttons remain fully usable.
                window.wx.error((err: unknown) => console.error('wechat jssdk config failed', err))
            } catch (e) {
                console.error('wechat share setup failed', e)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [data])
}
