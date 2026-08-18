import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {pickSearchParam} from '@/utils'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import FormVerifyBindEmail from '@/app/(auth)/verify-bind-email/FormVerifyBindEmail'

export default async function VerifyBindEmailPage(
    props: {
        searchParams: Promise<{email?: string | string[]}>
    }
) {
    const searchParams = await props.searchParams
    const authToken = await getServerSideAuth()
    if (!authToken) redirect('/signin')

    const email = pickSearchParam(searchParams.email)
    if (!email) redirect('/bind-email')

    const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
    if (!profile) redirect('/signin')
    if (profile.email) redirect(await returnTargetFromCookies())

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <FormVerifyBindEmail lang={lang} email={email}/>
    </div>
}
