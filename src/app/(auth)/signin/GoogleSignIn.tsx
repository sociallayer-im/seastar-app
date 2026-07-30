'use client'

import {GoogleOAuthProvider, useGoogleLogin} from '@react-oauth/google'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {clientCheckUserLoggedInAndRedirect, setAuth} from '@/utils'

/**
 * Google sign-in. The access token is exchanged for a session by our own route
 * handler (/api/google-signin), never here: that exchange needs NEXT_TOKEN, a
 * backend shared secret that mints a session for any email it is handed, so it
 * must stay server-side.
 *
 * NOTE: Google validates the JavaScript origin against the OAuth client's
 * registered list. app.sola.day has to be added there before this works on the
 * app domain — auth.sola.day is already registered, so it keeps working on that
 * host either way.
 */
export default function GoogleSignIn({lang}: {lang: Dictionary}) {
    return <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        <GoogleButton lang={lang}/>
    </GoogleOAuthProvider>
}

function GoogleButton({lang}: {lang: Dictionary}) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const login = useGoogleLogin({
        onSuccess: async ({access_token}) => {
            const loading = showLoading()
            try {
                const res = await fetch('/api/google-signin', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({access_token})
                })
                const data = await res.json()
                if (!res.ok || !data.token) {
                    throw new Error(data.message || res.statusText)
                }

                setAuth(data.token)
                await clientCheckUserLoggedInAndRedirect(data.token)
            } catch (e: unknown) {
                toast({
                    title: lang['Sign In'],
                    description: e instanceof Error ? e.message : 'Failed to sign in with Google',
                    variant: 'destructive'
                })
            } finally {
                closeModal(loading)
            }
        },
        onError: () => {
            toast({
                title: lang['Sign In'],
                description: 'Failed to sign in with Google',
                variant: 'destructive'
            })
        }
    })

    // See WalletSignIn: `btn btn-md` were daisyUI classes and daisyUI is not a
    // dependency of this app, so they rendered with no padding at all.
    return <Button
        variant="outline"
        onClick={() => login()}
        className="w-full justify-start gap-3 font-normal shadow-sm mb-3 sm:mb-0 [&_svg]:size-5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
            <path fill="#4285f4" fillRule="evenodd"
                d="M17.64 9.2q-.002-.956-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34a853" fillRule="evenodd"
                d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18"/>
            <path fill="#fbbc05" fillRule="evenodd"
                d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042z"/>
            <path fill="#ea4335" fillRule="evenodd"
                d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71"/>
        </svg>
        {lang['Google Auth']}
    </Button>
}
