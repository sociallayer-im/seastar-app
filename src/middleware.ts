import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers)
    headers.set("x-current-path", request.url)
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
