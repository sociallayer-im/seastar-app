'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {EventForm, FormSubmission, submitForm} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import FormFieldsInput, {FormValues, validateFormValues} from '@/components/client/FormFieldsInput'
import {getAuth} from '@/utils'

/**
 * Filling in a standalone form — and filling it in again.
 *
 * There is at most one submission per person per form (unique on form+user),
 * and re-submitting EDITS it. So this component does not distinguish "new" from
 * "edit" in what it sends: it prefills from whatever was answered before and
 * posts the whole answer set either way. What changes is only what it says.
 */
export default function FormFill({lang, form, submission, signedIn}: {
    lang: Dictionary
    form: EventForm
    submission: FormSubmission | null
    signedIn: boolean
}) {
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()

    const fields = [...form.fields].sort((a, b) => a.position - b.position)
    const [values, setValues] = useState<FormValues>(() => {
        const init: FormValues = {}
        submission?.answers.forEach(a => { init[a.form_field_id] = a.value || '' })
        return init
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    // The `submission` prop came from the server render and does not change
    // when we submit — without this the button still reads "Submit" and the
    // "you already responded" warning stays hidden after the first save, so a
    // second edit looks like a first one.
    const [responded, setResponded] = useState(!!submission)

    const submit = async () => {
        const authToken = getAuth()
        if (!authToken) {
            window.location.href = `/signin?return=/forms/${form.slug}`
            return
        }

        const newErrors = validateFormValues(fields, values, lang)
        if (Object.keys(newErrors).length) { setErrors(newErrors); return }

        setSaving(true)
        const loading = showLoading()
        try {
            await submitForm({
                params: {
                    slug: form.slug!,
                    answers: fields.map(f => ({field_id: f.id, value: values[f.id] || ''})),
                    authToken
                },
                clientMode: CLIENT_MODE
            })
            setDone(true)
            setResponded(true)
            toast({title: lang['Response recorded'], variant: 'success'})
        } catch (e: unknown) {
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed to submit'})
        } finally {
            setSaving(false)
            closeModal(loading)
        }
    }

    // An event's registration questions are answered by joining the event —
    // that path creates the participant, and this one does not, so the API
    // refuses it. Send them where it actually works rather than letting them
    // fill the whole thing in and fail at submit.
    if (form.event_id) {
        return <div className="max-w-[560px] mx-auto text-center py-16">
            <div className="text-gray-400 mb-3">{lang['Managed by the event']}</div>
            <a className="text-blue-500 underline" href={`/event/detail/${form.event_id}`}>
                {lang['Event']}
            </a>
        </div>
    }

    return <div className="max-w-[560px] mx-auto">
        <div className="text-xl font-semibold">{form.title}</div>
        {!!form.description &&
            <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{form.description}</div>}

        {/* An unpublished form is only readable by its author, so reaching this
            at all means previewing your own draft — show the questions rather
            than a refusal, with submit off because the API would refuse it. */}
        {!form.published &&
            <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2 mt-3">
                {lang['Draft']} — {lang['This form is not accepting responses']}
            </div>}

        {/* Said before they start, not after they submit — someone who does not
            realise they already answered would otherwise discover it by
            overwriting what they wrote. */}
        {responded &&
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                {lang['You already responded. Submitting again replaces your previous answers.']}
            </div>}

        <div className="mt-5">
            <FormFieldsInput
                fields={fields}
                values={values}
                errors={errors}
                onChange={(id, value) => {
                    setValues(prev => ({...prev, [id]: value}))
                    if (errors[id]) setErrors(prev => ({...prev, [id]: ''}))
                }}
                lang={lang}/>
        </div>

        <div className="mt-6 flex-row-item-center gap-3">
            <Button variant={'special'} onClick={submit} disabled={saving || !form.published}>
                {responded ? lang['Update Response'] : lang['Submit']}
            </Button>
            {done && <span className="text-sm text-green-600">{lang['Response recorded']}</span>}
        </div>

        {!signedIn &&
            <div className="text-xs text-gray-400 mt-3">{lang['Please login first']}</div>}

        {!!form.submission_message && done &&
            <div className="text-sm text-gray-600 mt-4 whitespace-pre-wrap">{form.submission_message}</div>}
    </div>
}
