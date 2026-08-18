import {redirect} from 'next/navigation'
import {getForm, getMyFormSubmission} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {FormAnswerValue} from '@/components/client/FormFieldsInput'

/**
 * What I answered — the page you land on after submitting.
 *
 * Before this existed, submitting left you sitting in the editor you had just
 * filled in, with your own answers in inputs: nothing said the submission had
 * been recorded except a toast, and the obvious next action on screen was to
 * submit again. This is the read-only receipt, and editing is a deliberate
 * step away from it rather than the default state.
 *
 * Signed-in only, by definition — a submission belongs to a person.
 */
export default async function FormSubmissionPage(props: {params: Promise<{slug: string}>}) {
    const {lang} = await selectLang()
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) {
        redirect(`/signin?return=/forms/${(await props.params).slug}/submission`)
    }

    const form = await getForm({
        params: {slug: (await props.params).slug, authToken},
        clientMode: CLIENT_MODE
    })
    if (!form) redirect('/404')

    const submission = await getMyFormSubmission({
        params: {slug: (await props.params).slug, authToken},
        clientMode: CLIENT_MODE
    })
    // Never answered it: there is no receipt to show, so show the form. Landing
    // on an empty preview would be a dead end with nothing to do on it.
    if (!submission) redirect(`/forms/${(await props.params).slug}`)

    const fields = [...form.fields].sort((a, b) => a.position - b.position)
    const byField = new Map(submission.answers.map(a => [a.form_field_id, a.value]))

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <div className="max-w-[560px] mx-auto">
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                {lang['Response recorded']}
            </div>

            <div className="text-xl font-semibold">{form.title}</div>
            <div className="text-xs text-gray-400 mt-1">
                {lang['Last updated']}: {new Date(submission.updated_at || submission.submitted_at).toLocaleString()}
            </div>

            {!!form.submission_message &&
                <div className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{form.submission_message}</div>}

            <div className="space-y-2 mt-5">
                {fields.map(field => (
                    <div key={field.id}>
                        <div className="text-xs text-gray-400 mb-0.5">{field.label}</div>
                        <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 min-h-[36px]">
                            <FormAnswerValue field={field} value={byField.get(field.id) ?? ''}/>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex-row-item-center gap-4 text-sm">
                <a className="text-blue-500 underline" href={`/forms/${form.slug}`}>
                    {lang['Edit Response']}
                </a>
                {(form.public_submissions || form.can_edit) &&
                    <a className="text-blue-500 underline" href={`/forms/${form.slug}/responses`}>
                        {lang['View responses']}
                    </a>}
                <a className="text-gray-400 underline" href="/forms?tab=filled">
                    {lang['Forms I Filled']}
                </a>
            </div>
        </div>
    </div>
}
