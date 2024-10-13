import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = new URL(request.url)
    const referer = url.searchParams.get('referer')
    const response = NextResponse.next()
    if (referer) {
        response.cookies.set('referer', referer)
    }

    return response
}

export const config = {
    matcher: ['/schedule/:path*'],
}
