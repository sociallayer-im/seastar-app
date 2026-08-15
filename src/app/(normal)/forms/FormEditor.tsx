'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {createForm, EventForm, updateForm} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import FormFieldsEditor, {emptyField, FormFieldDraft} from '@/components/client/FormFieldsEditor'
import {getAuth} from '@/utils'

/**
 * Create or edit a standalone form. One component for both, because the only
 * difference is whether there is a slug to PATCH.
 *
 * Existing fields keep their id through a save: the answers already submitted
 * point at `form_field_id`, so a re-created field would orphan them.
 */
export default function FormEditor({lang, form}: {
    lang: Dictionary
    form?: EventForm | null
}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()

    const [title, setTitle] = useState(form?.title || '')
    const [description, setDescription] = useState(form?.description || '')
    const [published, setPublished] = useState(form?.published ?? true)
    const [fields, setFields] = useState<FormFieldDraft[]>(
        form?.fields?.length
            ? [...form.fields]
                .sort((a, b) => a.position - b.position)
                .map((f, i) => ({
                    id: f.id,
                    label: f.label,
                    required: f.required,
                    position: i,
                    field_type: f.field_type,
                    options: f.options || []
                }))
            : [emptyField(0)]
    )
    const [saving, setSaving] = useState(false)

    const save = async () => {
        const authToken = getAuth()
        if (!authToken) { window.location.href = '/signin?return=/forms'; return }

        // A question with no label is an empty row the author left behind, not
        // a question — the API rejects it outright, so drop it here rather
        // than failing the whole save on it.
        const payload = fields
            .filter(f => f.label.trim())
            .map((f, i) => ({...f, label: f.label.trim(), position: i}))

        setSaving(true)
        const loading = showLoading()
        try {
            const saved = form?.slug
                ? await updateForm({
                    params: {
                        slug: form.slug,
                        title: title.trim() || lang['Untitled Form'],
                        description,
                        published,
                        fields: payload,
                        authToken
                    },
                    clientMode: CLIENT_MODE
                })
                : await createForm({
                    params: {
                        title: title.trim() || lang['Untitled Form'],
                        description,
                        published,
                        fields: payload,
                        authToken
                    },
                    clientMode: CLIENT_MODE
                })
            router.push(`/forms/${saved.slug}/responses`)
            router.refresh()
        } catch (e: unknown) {
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed to save'})
        } finally {
            setSaving(false)
            closeModal(loading)
        }
    }

    return <div className="max-w-[720px] mx-auto">
        <div className="text-xl font-semibold mb-4">
            {form ? lang['Edit Form'] : lang['Create Form']}
        </div>

        <div className="space-y-4">
            <div>
                <div className="text-sm font-medium mb-1">{lang['Form Title']}</div>
                <Input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={lang['Untitled Form']}/>
            </div>

            <div>
                <div className="text-sm font-medium mb-1">{lang['Form Description']}</div>
                <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 min-h-[80px]"
                    value={description || ''}
                    onChange={e => setDescription(e.target.value)}/>
            </div>

            <div>
                <div className="text-sm font-medium mb-2">{lang['Questions']}</div>
                <FormFieldsEditor fields={fields} setFields={setFields} lang={lang}/>
            </div>

            {/* Unpublished is the draft state: the form is invisible and
                refuses responses, which is what makes it safe to keep editing
                one that people can already reach by link. */}
            <label className="flex-row-item-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={published}
                    onChange={e => setPublished(e.target.checked)}/>
                {lang['Published']}
            </label>

            <div className="flex-row-item-center gap-3 pt-2">
                <Button variant={'special'} onClick={save} disabled={saving}>
                    {lang['Save']}
                </Button>
                <Button variant={'secondary'} onClick={() => router.push('/forms')}>
                    {lang['Cancel']}
                </Button>
            </div>
        </div>
    </div>
}
