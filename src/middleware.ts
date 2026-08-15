import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {getGroupSubdomain} from '@/utils'
import {AUTH_HOST_SUBDOMAINS, CANONICAL_HOST, CANONICAL_REDIRECT_HOSTS} from '@/app/config'

/**
 * True for the host the standalone auth app used to answer on (auth.sola.day,
 * auth.juluo.xyz, auth-beta…). Now that this app serves that domain too, its
 * root has to keep showing the sign-in screen rather than this app's home page
 * — old links and bookmarks point at `https://auth.<domain>/?return=…`.
 */
const isAuthHost = (host?: string | null) => {
    if (!host) return false
    const labels = host.split(':')[0].split('.')
    return labels.length > 2 && AUTH_HOST_SUBDOMAINS.includes(labels[0])
}

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers)
    // Behind Traefik the Node server sees itself as the request target, so
    // request.url reads https://localhost:3000/... — which then ends up in
    // every consumer of x-current-path (the share page QR code, most
    // visibly). The forwarded headers carry the URL the visitor typed.
    const host = headers.get('x-forwarded-host')?.split(',')[0].trim() || headers.get('host')

    // Host normalisation: app.sola.day and www.sola.day are now aliases of
    // sola.day. Done here rather than in Traefik because ginger's config
    // exposes no way to attach an arbitrary redirect middleware to a router.
    //
    // 308 rather than 301: it is the only permanent redirect browsers are
    // required to replay with the original method and body, and the auth
    // screens POST. 301 would silently turn those into GETs.
    //
    // Runs before every other branch on purpose — the alias hosts should never
    // reach the sign-in rewrite or the group-subdomain lookup below.
    if (CANONICAL_HOST && host) {
        const hostname = host.split(':')[0].toLowerCase()
        if (CANONICAL_REDIRECT_HOSTS.includes(hostname) && hostname !== CANONICAL_HOST) {
            const target = new URL(request.url)
            target.protocol = 'https:'
            target.host = CANONICAL_HOST
            target.port = ''
            return NextResponse.redirect(target, 308)
        }
    }

    const groupHandle = getGroupSubdomain(host)
    const requestUrl = new URL(request.url)
    if (host) {
        requestUrl.port = '' // else the upstream :3000 survives a port-less host
        requestUrl.host = host
        const proto = headers.get('x-forwarded-proto')?.split(',')[0].trim()
        if (proto) requestUrl.protocol = proto
    }
    headers.set("x-current-path", requestUrl.toString())
    !!groupHandle && headers.set("x-event-home", groupHandle)

    const url = new URL(request.url)

    // Serve the sign-in screen at the auth host's root. A rewrite, not a
    // redirect, so the address bar keeps the URL the user arrived on.
    const response = isAuthHost(host) && url.pathname === '/'
        ? NextResponse.rewrite(new URL(`/signin${url.search}`, request.url), {request: {headers}})
        : NextResponse.next({ headers })

    const referer = url.searchParams.get('referer')
    if (referer) {
        response.cookies.set('referer', referer)
    }

    // Where to land after signing in. Carried in a cookie rather than threaded
    // through every auth screen's query string — the same contract the
    // standalone auth app used, so existing ?return= links work unchanged.
    const returnTo = url.searchParams.get('return')
    if (returnTo) {
        response.cookies.set('return', returnTo)
    }

    return response
}

export const config = {
    matcher: ['/((?!api|/images|/fonts|favicon.ico|sitemap.xml|robots.txt).*)'],
}
