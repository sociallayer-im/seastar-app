import {redirect} from 'next/navigation'
import {selectLang} from '@/app/actions'
import {pickSearchParam} from '@/utils'
import {PHONE_LOGIN} from '@/app/config'
import FormVerifyPhone from '@/app/(auth)/verify-phone/FormVerifyPhone'

/**
 * Code entry for SMS sign-in, the counterpart of /verify-email.
 */
export default async function VerifyPhonePage(
    props: {
        searchParams: Promise<{phone?: string | string[]}>
    }
) {
    const searchParams = await props.searchParams
    // Nothing here works on a deployment without SMS — the endpoints 404.
    if (!PHONE_LOGIN) redirect('/signin')

    const phone = pickSearchParam(searchParams.phone)
    // Nothing to verify without a number — start over rather than render a form
    // that can only fail.
    if (!phone) redirect('/signin')

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <FormVerifyPhone lang={lang} phone={phone}/>
    </div>
}
