import {redirect} from 'next/navigation'
import {getProfileDetailByAuth} from '@sola/sdk'
import {getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE, PHONE_LOGIN} from '@/app/config'
import {pickSearchParam} from '@/utils'
import {returnTargetFromCookies} from '@/app/(auth)/authRedirect'
import FormVerifyBindPhone from '@/app/(auth)/verify-bind-phone/FormVerifyBindPhone'

export default async function VerifyBindPhonePage(
    props: {
        searchParams: Promise<{phone?: string | string[]}>
    }
) {
    const searchParams = await props.searchParams
    if (!PHONE_LOGIN) redirect('/signin')

    const authToken = await getServerSideAuth()
    if (!authToken) redirect('/signin')

    const phone = pickSearchParam(searchParams.phone)
    if (!phone) redirect('/bind-phone')

    const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
    if (!profile) redirect('/signin')
    if (profile.phone) {
        redirect(!profile.email ? '/bind-email' : !profile.name ? '/register' : returnTargetFromCookies())
    }

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <FormVerifyBindPhone lang={lang} phone={phone}/>
    </div>
}
