import {redirect} from 'next/navigation'
import {FormListItem, FormSubmissionWithForm, listMyForms, listMyFormSubmissions} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface FormsHubDataProps {
    created: FormListItem[]
    filled: FormSubmissionWithForm[]
}

export default async function FormsHubData(): Promise<FormsHubDataProps> {
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) redirect('/signin?return=/forms')

    // Two independent lists — neither depends on the other, so they go out
    // together rather than one after the page has already waited for the first.
    const [created, filled] = await Promise.all([
        listMyForms({params: {authToken}, clientMode: CLIENT_MODE}),
        listMyFormSubmissions({params: {authToken}, clientMode: CLIENT_MODE})
    ])

    return {created, filled}
}
