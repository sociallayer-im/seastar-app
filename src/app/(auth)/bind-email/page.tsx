import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import BindEmailForm from '@/app/(auth)/bind-email/BindEmailForm'

/**
 * Attach an email to a wallet-first account. Same path as the standalone auth
 * app's /bind-email, so the existing entry points (the profile menu, and the
 * Remember page's prompt) keep working with only their host dropped.
 */
export default async function BindEmailPage() {
    const authToken = await getServerSideAuth()
    if (!authToken) redirect('/signin')

    const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
    if (!profile) redirect('/signin')
    // The backend only lets an email be set once, so there is nothing to do here
    // for an account that already has one.
    if (profile.email) redirect(returnTargetFromCookies())

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <BindEmailForm lang={lang}/>
    </div>
}
