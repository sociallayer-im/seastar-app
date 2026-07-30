import {NextResponse} from 'next/server'
import {trustedSignIn} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

/**
 * Exchanges a Google access token for a Social Layer session.
 *
 * Server-side for one reason: the exchange is gated by NEXT_TOKEN, a shared
 * secret that makes the backend mint a session for ANY email it is given. It
 * must never reach the browser, and this handler must never sign in an address
 * it hasn't had Google confirm — so the token is presented to Google's userinfo
 * endpoint here and only the email Google returns is used. A caller-supplied
 * email is never trusted.
 */
export async function POST(req: Request) {
    const nextToken = process.env.NEXT_TOKEN
    if (!nextToken) {
        console.error('google-signin: NEXT_TOKEN is not configured')
        return NextResponse.json({message: 'Google sign-in is not configured'}, {status: 503})
    }

    try {
        const {access_token} = await req.json()
        if (!access_token || typeof access_token !== 'string') {
            return NextResponse.json({message: 'invalid parameters'}, {status: 400})
        }

        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {Authorization: `Bearer ${access_token}`, Accept: 'application/json'},
            cache: 'no-store'
        })
        const info = await res.json().catch(() => ({}))

        // email_verified guards against an account whose address Google itself
        // hasn't confirmed — signing that in would let someone claim an address
        // they don't control.
        if (!res.ok || !info.email || info.email_verified === false) {
            return NextResponse.json({message: 'Invalid Google access token'}, {status: 401})
        }

        const {token} = await trustedSignIn({
            params: {email: String(info.email).toLowerCase().trim(), nextToken},
            clientMode: CLIENT_MODE
        })
        return NextResponse.json({token})
    } catch (e: unknown) {
        // Deliberately not echoed to the client: this path handles a secret and
        // an upstream response, neither of which should shape an error string a
        // caller can read.
        console.error('google-signin failed', e)
        return NextResponse.json({message: 'Failed to sign in with Google'}, {status: 500})
    }
}
