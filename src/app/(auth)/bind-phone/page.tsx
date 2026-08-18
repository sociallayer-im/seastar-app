import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE, PHONE_LOGIN} from '@/app/config'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import BindPhoneForm from '@/app/(auth)/bind-phone/BindPhoneForm'

/**
 * Attach a mobile number to a WeChat account — the first onboarding step on CN,
 * and the only one that can't be skipped. Someone who signed in through a 服务号
 * is a mainland user by construction and has a number; the same is not true of
 * an email or wallet account, which is why this is reached only via
 * onboardingTarget's `wechat` check rather than being asked of everyone.
 */
export default async function BindPhonePage() {
    if (!PHONE_LOGIN) redirect('/signin')

    const authToken = await getServerSideAuth()
    if (!authToken) redirect('/signin')

    const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
    if (!profile) redirect('/signin')
    // The backend only lets a number be set once, so there is nothing to do
    // here for an account that already has one — move it along the same chain
    // onboardingTarget would.
    if (profile.phone) {
        redirect(!profile.email ? '/bind-email' : !profile.name ? '/register' : await returnTargetFromCookies())
    }

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <BindPhoneForm lang={lang}/>
    </div>
}
