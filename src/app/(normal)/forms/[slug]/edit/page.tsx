import {redirect} from 'next/navigation'
import {getForm} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import FormEditor from '@/app/(normal)/forms/FormEditor'

export default async function EditFormPage(props: {params: {slug: string}}) {
    const {lang} = await selectLang()
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) redirect(`/signin?return=/forms/${props.params.slug}/edit`)

    // Fetched WITH the token: an unpublished form is invisible without one, so
    // an anonymous fetch here would 404 the author out of their own draft.
    const form = await getForm({params: {slug: props.params.slug, authToken}, clientMode: CLIENT_MODE})
    if (!form) redirect('/404')

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <FormEditor lang={lang} form={form}/>
    </div>
}
