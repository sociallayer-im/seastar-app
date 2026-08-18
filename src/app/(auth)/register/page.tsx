import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE, PHONE_LOGIN} from '@/app/config'
import {pickSearchParam} from '@/utils'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import RegisterForm from '@/app/(auth)/register/RegisterForm'

/**
 * Username set-up, the step between "authenticated" and "usable account".
 * Same path as the standalone auth app's /register, including ?username= as the
 * prefill.
 */
export default async function RegisterPage(
    props: {
        searchParams: Promise<{username?: string | string[]}>
    }
) {
    const searchParams = await props.searchParams
    const authToken = await getServerSideAuth()
    if (!authToken) redirect('/signin')

    const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
    // A stale or revoked token: send them back to sign in rather than showing a
    // form whose submit can only 401.
    if (!profile) redirect('/signin')
    // Already named — this step is done, don't let them rename by revisiting it.
    if (profile.name) redirect(returnTargetFromCookies())
    // A WeChat account owes a phone number first. Not merely the order we
    // prefer: picking a name closes the merge window (AuthController#mergeable?),
    // so someone who got here early and named themselves could no longer bind a
    // number that already had an account — and the bind step has no Skip, which
    // would strand them. soon refuses the rename too; this only avoids showing a
    // form whose submit can only fail.
    if (PHONE_LOGIN && profile.wechat && !profile.phone) redirect('/bind-phone')

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <RegisterForm lang={lang} prefill={pickSearchParam(searchParams.username)}/>
    </div>
}
