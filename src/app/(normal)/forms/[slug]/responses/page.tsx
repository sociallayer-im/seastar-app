import {redirect} from 'next/navigation'
import {getForm, listFormResponses} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {FormAnswerValue} from '@/components/client/FormFieldsInput'

/**
 * What people answered. Author only — the API 403s for anyone else, so this
 * page fetching it at all is the authorization check.
 */
export default async function FormResponsesPage(props: {params: {slug: string}}) {
    const {lang} = await selectLang()
    // No sign-in gate: a form whose author turned on public responses is meant
    // to be readable by anyone, and the API is what decides. Sending a signed-
    // out visitor to /signin first would hide a page that is public.
    const authToken = await getServerSideAuth()

    const form = await getForm({
        params: {slug: props.params.slug, authToken: authToken || undefined},
        clientMode: CLIENT_MODE
    })
    if (!form) redirect('/404')

    const result = await listFormResponses({
        params: {slug: props.params.slug, authToken: authToken || undefined},
        clientMode: CLIENT_MODE
    }).catch(() => null)
    // null means the API refused: somebody else's form, and not a public one.
    if (!result) redirect('/404')
    const {responses, total} = result

    // Only the author gets the editor link — everyone else is a reader here.
    // can_edit comes from the API, which is the only place that knows.
    const canEdit = form.can_edit === true && !form.event_id

    const fields = [...form.fields].sort((a, b) => a.position - b.position)

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <div className="max-w-[720px] mx-auto">
            <div className="flex-row-item-center justify-between mb-1">
                <div className="text-xl font-semibold">{form.title}</div>
                {canEdit &&
                    <a className="text-sm text-blue-500 underline" href={`/forms/${form.slug}/edit`}>
                        {lang['Edit Form']}
                    </a>}
            </div>
            <div className="text-xs text-gray-500 mb-4">
                {/* Says so when it is showing a subset rather than letting a
                    truncated list read as the whole thing. */}
                {responses.length < total
                    ? `${responses.length} / ${total} ${lang['Responses']}`
                    : `${total} ${lang['Responses']}`}
            </div>

            {!responses.length
                ? <div className="text-sm text-gray-400 py-12 text-center">{lang['No responses yet']}</div>
                : <div className="space-y-3">
                    {responses.map(sub => {
                        const byField = new Map(sub.answers.map(a => [a.form_field_id, a.value]))
                        return <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex-row-item-center gap-2 mb-3">
                                <img src={sub.user?.image_url || '/images/default_avatar.png'}
                                    className="w-7 h-7 rounded-full object-cover" alt=""/>
                                <div className="text-sm font-semibold">
                                    {sub.user?.nickname || sub.user?.name}
                                </div>
                                <div className="text-xs text-gray-400 ml-auto">
                                    {new Date(sub.submitted_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {fields.map(field => (
                                    <div key={field.id}>
                                        <div className="text-xs text-gray-400 mb-0.5">{field.label}</div>
                                        <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 min-h-[36px]">
                                            <FormAnswerValue field={field} value={byField.get(field.id) ?? ''}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    })}
                </div>
            }
        </div>
    </div>
}
