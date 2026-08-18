import {headers} from 'next/headers'
import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE, PHONE_LOGIN, THIRD_PARTY_LOGIN, WALLET_LOGIN, WECHAT_LOGIN} from '@/app/config'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import EmailSignIn from '@/app/(auth)/signin/EmailSignIn'
import PhoneOrEmailSignIn from '@/app/(auth)/signin/PhoneOrEmailSignIn'
import WalletSignIn from '@/app/(auth)/signin/WalletSignIn'
import GoogleSignIn from '@/app/(auth)/signin/GoogleSignIn'
import WechatSignIn from '@/app/(auth)/signin/WechatSignIn'

/**
 * The sign-in screen. Reachable at /signin, and at the auth host's '/' via the
 * middleware rewrite — so every sign-in link already in circulation, including
 * `https://auth.sola.day/?return=…`, lands here unchanged.
 */
export default async function SignInPage(props: {searchParams?: Promise<{error?: string}>}) {
    const searchParams = await props.searchParams
    // Already signed in? Go straight where they were headed. Checked against the
    // raw token rather than getCurrProfile, which reports an account with no
    // username as signed-out and would trap it on this page instead of sending
    // it to /register.
    const authToken = await getServerSideAuth()
    if (authToken) {
        const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
        if (profile && !profile.name) redirect('/register')
        if (profile) redirect(await returnTargetFromCookies())
    }

    const {lang} = await selectLang()

    // 网页授权 only works inside the WeChat client — opening the consent URL in
    // any other browser dead-ends on "请在微信客户端打开链接". So the button is
    // gated on the UA as well as the build flag, rather than offering a link
    // that cannot work. (Desktop would need 开放平台 QR sign-in, a separate app.)
    const inWechat = /MicroMessenger/i.test((await headers()).get('user-agent') ?? '')
    const wechatLogin = WECHAT_LOGIN && inWechat

    // All alternatives are build-time flags (CN leaves only WeChat, in the
    // WeChat browser, and email). With none, the "or" divider would separate
    // the email field from nothing — so it goes too.
    const alternatives = [THIRD_PARTY_LOGIN, WALLET_LOGIN, wechatLogin].filter(Boolean).length

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <div className="max-w-[560px] mx-auto p-4 w-full">
            <div className="font-semibold mb-6 text-xl">{lang['Sign In']}</div>
            {/* The WeChat flow is a full-page redirect, so a failure can only
                report itself by coming back here with a reason. 'cancelled' is
                the user declining the consent screen — not an error to shout
                about. */}
            {!!searchParams?.error && searchParams.error !== 'wechat_cancelled' &&
                <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm p-3">
                    {lang['WeChat sign-in failed, please try again']}
                </div>}
            {/* Where SMS exists it shares the top slot with email behind a
                switch; everywhere else the email field stands alone exactly as
                it did, with no tab bar for a single choice. */}
            {PHONE_LOGIN ? <PhoneOrEmailSignIn lang={lang}/> : <EmailSignIn lang={lang}/>}
            {alternatives > 0 && <>
                <div className="flex flex-row items-center mb-3 after:content-[''] after:block after:flex-1 after:bg-secondary after:h-px before:block before:flex-1 before:bg-secondary before:h-px">
                    <div className="mx-2 text-sm">{lang['or']}</div>
                </div>
                {/* Two side by side when both are on; a lone one spans the row
                    rather than sitting in a half-width column. */}
                <div className={`flex flex-col sm:grid sm:gap-2 ${alternatives > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                    {/* First: inside the WeChat browser it is the only one that
                        doesn't send the user out of the app to read a code. */}
                    {wechatLogin && <WechatSignIn lang={lang}/>}
                    {THIRD_PARTY_LOGIN && <GoogleSignIn lang={lang}/>}
                    {WALLET_LOGIN && <WalletSignIn lang={lang}/>}
                </div>
            </>}
        </div>
    </div>
}
