import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {getGroupSubdomain} from '@/utils'

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers)
    const host = headers.get('host')
    console.log('app host', host)
    const groupHandle = getGroupSubdomain(host)
    headers.set("x-current-path", request.url)
    !!groupHandle && headers.set("x-event-home", groupHandle)

    const response = NextResponse.next({ headers })

    const url = new URL(request.url)
    const referer = url.searchParams.get('referer')
    if (referer) {
        response.cookies.set('referer', referer)
    }

    return response
}

export const config = {
    matcher: ['/((?!api|/images|/fonts|favicon.ico|sitemap.xml|robots.txt).*)'],
}





