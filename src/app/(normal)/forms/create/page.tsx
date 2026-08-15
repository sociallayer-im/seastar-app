import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import FormEditor from '@/app/(normal)/forms/FormEditor'

export default async function CreateFormPage() {
    const {lang} = await selectLang()
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) redirect('/signin?return=/forms/create')

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <FormEditor lang={lang}/>
    </div>
}
