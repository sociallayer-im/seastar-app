import {redirect} from 'next/navigation'
import {selectLang} from '@/app/actions'
import {pickSearchParam} from '@/utils'
import FormVerifyEmail from '@/app/(auth)/verify-email/FormVerifyEmail'

/**
 * Code entry for email sign-in. Same URL shape as the standalone auth app
 * (/verify-email?email=…) so the flow — and browser-back out of it — is
 * unchanged.
 */
export default async function VerifyEmailPage({searchParams}: {
    searchParams: {email?: string | string[]}
}) {
    const email = pickSearchParam(searchParams.email)
    // Nothing to verify without an address — start over rather than render a
    // form that can only fail.
    if (!email) redirect('/signin')

    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <FormVerifyEmail lang={lang} email={email}/>
    </div>
}
