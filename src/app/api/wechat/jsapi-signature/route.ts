import {NextRequest, NextResponse} from 'next/server'
import {wechatConfigured} from '../wechat'
import {signJsApiUrl} from '../jsapi'

/**
 * GET /api/wechat/jsapi-signature?url=<the page URL as the browser shows it>
 *
 * Called client-side, only when the page detects it's running inside
 * WeChat's in-app browser — everywhere else `wx` doesn't exist and there's
 * nothing to sign for. `url` comes from the caller (`location.href.split('#')[0]`)
 * rather than being derived here, because behind Traefik the server only
 * sees its own request, not necessarily byte-identical to what's in the
 * visitor's address bar.
 */
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({error: 'url is required'}, {status: 400})
    if (!wechatConfigured()) return NextResponse.json({error: 'wechat not configured'}, {status: 404})

    try {
        const signed = await signJsApiUrl(url)
        return NextResponse.json(signed)
    } catch (e) {
        console.error('wechat/jsapi-signature failed', e)
        return NextResponse.json({error: 'signing failed'}, {status: 502})
    }
}
