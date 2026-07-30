import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {getGroupSubdomain} from '@/utils'
import {AUTH_HOST_SUBDOMAINS} from '@/app/config'

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
    const host = headers.get('host')
    const groupHandle = getGroupSubdomain(host)
    headers.set("x-current-path", request.url)
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
