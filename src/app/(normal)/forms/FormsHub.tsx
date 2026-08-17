'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {deleteForm, FormListItem, FormSubmissionWithForm} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {getAuth} from '@/utils'

export default function FormsHub({lang, created, filled, initialTab}: {
    lang: Dictionary
    created: FormListItem[]
    filled: FormSubmissionWithForm[]
    /** From ?tab= — so the tab survives a reload, a shared link and the back
     *  button. It comes in as a prop rather than from useSearchParams because
     *  the page already reads searchParams on the server. */
    initialTab: 'created' | 'filled'
}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const [tab, setTab] = useState<'created' | 'filled'>(initialTab)

    const switchTab = (key: 'created' | 'filled') => {
        setTab(key)
        // replace, not push: switching tabs twice should not take two presses
        // of the back button to leave the page. scroll: false because the list
        // is right there — jumping to the top is not what a tab click means.
        router.replace(key === 'created' ? '/forms' : `/forms?tab=${key}`, {scroll: false})
    }

    const remove = (form: FormListItem) => showConfirmDialog({
        lang,
        type: 'danger',
        title: lang['Delete Form'],
        content: lang['Are you sure you want to delete this form?'],
        onConfig: async () => {
            const authToken = getAuth()
            if (!authToken) { window.location.href = '/signin'; return }
            const loading = showLoading()
            try {
                await deleteForm({params: {slug: form.slug, authToken}, clientMode: CLIENT_MODE})
                router.refresh()
            } catch (e: unknown) {
                toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed'})
            } finally {
                closeModal(loading)
            }
        }
    })

    return <div className="max-w-[720px] mx-auto">
        <div className="flex-row-item-center justify-between mb-4">
            <div className="text-xl font-semibold">{lang['Forms']}</div>
            <Button variant={'special'} className="text-sm" onClick={() => router.push('/forms/create')}>
                {lang['Create Form']}
            </Button>
        </div>

        <div className="flex-row-item-center gap-4 border-b border-gray-200 mb-4">
            {([['created', lang['My Forms']], ['filled', lang['Forms I Filled']]] as const).map(([key, label]) => (
                <button key={key}
                    className={`pb-2 text-sm ${tab === key ? 'font-semibold border-b-2 border-black' : 'text-gray-500'}`}
                    onClick={() => switchTab(key)}>
                    {label}
                </button>
            ))}
        </div>

        {tab === 'created' && (
            !created.length
                ? <div className="text-sm text-gray-400 py-12 text-center">{lang['No forms yet']}</div>
                : <div className="space-y-3">
                    {created.map(form => (
                        <div key={form.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex-row-item-center justify-between gap-2">
                                <div className="font-semibold">{form.title}</div>
                                <div className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                    form.published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {form.published ? lang['Published'] : lang['Draft']}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {form.field_count} {lang['Questions']} · {form.submission_count} {lang['Responses']}
                            </div>

                            {/* An event's registration form is edited from the
                                event, not here — two editors over the same
                                fields would quietly overwrite each other. */}
                            {form.event_id
                                ? <div className="mt-3 flex-row-item-center gap-3 text-sm flex-wrap">
                                    <span className="text-xs text-gray-400">{lang['Managed by the event']}</span>
                                    <a className="text-blue-500 underline" href={`/event/detail/${form.event_id}`}>
                                        {lang['Event']}
                                    </a>
                                    {/* An event form is edited on the event, but its
                                        answers still live here — and are the whole
                                        point once they are public. */}
                                    <a className="text-blue-500 underline" href={`/forms/${form.slug}/responses`}>
                                        {lang['Responses']}
                                    </a>
                                </div>
                                : <div className="mt-3 flex-row-item-center gap-3 text-sm flex-wrap">
                                    <a className="text-blue-500 underline" href={`/forms/${form.slug}/edit`}>
                                        {lang['Edit Form']}
                                    </a>
                                    <a className="text-blue-500 underline" href={`/forms/${form.slug}/responses`}>
                                        {lang['Responses']}
                                    </a>
                                    <a className="text-blue-500 underline" href={`/forms/${form.slug}`}>
                                        {lang['Preview']}
                                    </a>
                                    <button className="text-red-400 hover:text-red-500"
                                        onClick={() => remove(form)}>
                                        {lang['Delete']}
                                    </button>
                                </div>
                            }
                        </div>
                    ))}
                </div>
        )}

        {tab === 'filled' && (
            !filled.length
                ? <div className="text-sm text-gray-400 py-12 text-center">
                    {lang['You have not filled in any form yet']}
                </div>
                : <div className="space-y-3">
                    {filled.map(sub => (
                        /* An event's registration answers live on the event
                           page — /forms/<slug> refuses that form, so linking
                           there would be a dead end. */
                        <a key={sub.id}
                            href={sub.form.event_id
                                ? `/event/detail/${sub.form.event_id}`
                                : `/forms/${sub.form.slug}`}
                            className="block border border-gray-200 rounded-lg p-4 hover:border-green-300">
                            <div className="flex-row-item-center justify-between gap-2">
                                <div className="font-semibold">{sub.form.title}</div>
                                {/* A status is a decision somebody made about
                                    your submission — approved, rejected,
                                    pending review. Only an event's
                                    registration has one: nobody reviews a
                                    survey response, so the "pending" the API
                                    stores for a standalone form means nothing
                                    and reads as "still waiting on someone". */}
                                {!!sub.form.event_id &&
                                    <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                                        {sub.status}
                                    </div>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {lang['Last updated']}: {new Date(sub.updated_at || sub.submitted_at).toLocaleString()}
                            </div>
                            {/* The answers stay editable — that is the point of
                                listing them here rather than just recording
                                that you responded. */}
                            <div className="text-sm text-blue-500 underline mt-2">
                                {sub.form.event_id ? lang['Event'] : lang['Edit Response']}
                            </div>
                        </a>
                    ))}
                </div>
        )}
    </div>
}
