import {redirect} from 'next/navigation'
import {getForm, getMyFormSubmission} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import FormFill from '@/app/(normal)/forms/[slug]/FormFill'

/**
 * The shareable form link.
 *
 * Readable signed out — a form nobody can see is not a form you can send to
 * anyone — but answering needs an account, because a submission belongs to a
 * person and is what makes coming back to edit it possible at all.
 */
export default async function FormPage(props: {params: {slug: string}}) {
    const {lang} = await selectLang()
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()

    const form = await getForm({
        params: {slug: props.params.slug, authToken: authToken || undefined},
        clientMode: CLIENT_MODE
    })
    if (!form) redirect('/404')

    // What they answered last time, so the form comes back filled in rather
    // than blank — editing a response means seeing it first.
    const submission = authToken && currProfile
        ? await getMyFormSubmission({
            params: {slug: props.params.slug, authToken},
            clientMode: CLIENT_MODE
        })
        : null

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <FormFill lang={lang} form={form} submission={submission} signedIn={!!currProfile}/>
    </div>
}
