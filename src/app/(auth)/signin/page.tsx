import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE, THIRD_PARTY_LOGIN, WALLET_LOGIN} from '@/app/config'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import EmailSignIn from '@/app/(auth)/signin/EmailSignIn'
import WalletSignIn from '@/app/(auth)/signin/WalletSignIn'
import GoogleSignIn from '@/app/(auth)/signin/GoogleSignIn'

/**
 * The sign-in screen. Reachable at /signin, and at the auth host's '/' via the
 * middleware rewrite — so every sign-in link already in circulation, including
 * `https://auth.sola.day/?return=…`, lands here unchanged.
 */
export default async function SignInPage() {
    // Already signed in? Go straight where they were headed. Checked against the
    // raw token rather than getCurrProfile, which reports an account with no
    // username as signed-out and would trap it on this page instead of sending
    // it to /register.
    const authToken = await getServerSideAuth()
    if (authToken) {
        const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
        if (profile && !profile.name) redirect('/register')
        if (profile) redirect(returnTargetFromCookies())
    }

    const {lang} = await selectLang()

    // Both alternatives are build-time flags (CN turns both off, leaving email
    // only). With neither, the "or" divider would separate the email field from
    // nothing — so it goes too.
    const alternatives = [THIRD_PARTY_LOGIN, WALLET_LOGIN].filter(Boolean).length

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <div className="max-w-[560px] mx-auto p-4 w-full">
            <div className="font-semibold mb-6 text-xl">{lang['Sign In']}</div>
            <EmailSignIn lang={lang}/>
            {alternatives > 0 && <>
                <div className="flex flex-row items-center mb-3 after:content-[''] after:block after:flex-1 after:bg-secondary after:h-[1px] before:block before:flex-1 before:bg-secondary before:h-[1px]">
                    <div className="mx-2 text-sm">{lang['or']}</div>
                </div>
                {/* Two side by side when both are on; a lone one spans the row
                    rather than sitting in a half-width column. */}
                <div className={`flex flex-col sm:grid sm:gap-2 ${alternatives > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                    {THIRD_PARTY_LOGIN && <GoogleSignIn lang={lang}/>}
                    {WALLET_LOGIN && <WalletSignIn lang={lang}/>}
                </div>
            </>}
        </div>
    </div>
}
