'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {
    EventForm,
    FormSubmission,
    getEventForm,
    getMyEventFormSubmission,
    updateMyFormSubmission
} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import FormFieldsInput, {
    FormAnswerValue,
    FormValues,
    validateFormValues
} from '@/components/client/FormFieldsInput'

/**
 * "What did I write on my application, and can I fix it?"
 *
 * The dialog itself already existed — inside the participants tab, reached by
 * finding yourself in the attendee list. That tab is hidden on any ticketed
 * event for everyone but the organizer (`showParticipants`), so for exactly
 * the events where people pay to apply, an applicant had no way to reach their
 * own answers at all. This puts it where their registration status is.
 *
 * Editing is allowed while the application is still `pending`. Once the
 * organizer has decided, the answers are what they decided on and become
 * read-only — the same rule the standalone form applies by returning an edited
 * submission to pending, expressed here as "you cannot change it any more"
 * because an event application also carries a seat.
 */
export default function MyApplicationBtn({eventId, lang, className, editable}: {
    eventId: string
    lang: Dictionary
    className?: string
    /** Pending: still editable. Decided: read-only. */
    editable: boolean
}) {
    const {showLoading, closeModal, openModal} = useModal()
    const {toast} = useToast()

    const open = async () => {
        const authToken = getAuth()
        if (!authToken) { window.location.href = '/signin'; return }

        const loading = showLoading()
        try {
            const [form, submission] = await Promise.all([
                getEventForm({params: {eventId, authToken}, clientMode: CLIENT_MODE}),
                getMyEventFormSubmission({params: {eventId, authToken}, clientMode: CLIENT_MODE})
            ])
            closeModal(loading)
            if (!form) {
                toast({title: lang['No answers submitted'], variant: 'destructive'})
                return
            }
            openModal({
                content: (close) => (
                    <ApplicationDialog
                        lang={lang}
                        form={form}
                        submission={submission}
                        editable={editable}
                        close={close!}
                        onSave={async (answers) => {
                            close?.()
                            const saving = showLoading()
                            try {
                                await updateMyFormSubmission({
                                    params: {eventId, authToken, formAnswers: answers},
                                    clientMode: CLIENT_MODE
                                })
                                toast({title: lang['Response recorded'], variant: 'success'})
                                window.location.reload()
                            } catch (e: unknown) {
                                toast({
                                    title: e instanceof Error ? e.message : 'Failed to update',
                                    variant: 'destructive'
                                })
                            } finally {
                                closeModal(saving)
                            }
                        }}
                    />
                )
            })
        } catch (e: unknown) {
            closeModal(loading)
            toast({title: e instanceof Error ? e.message : 'Failed to load', variant: 'destructive'})
        }
    }

    return <Button variant={'secondary'} className={className} onClick={open}>
        <span>{editable ? lang['Edit my answers'] : lang['My Application']}</span>
    </Button>
}

function ApplicationDialog({lang, form, submission, editable, close, onSave}: {
    lang: Dictionary
    form: EventForm
    submission: FormSubmission | null
    editable: boolean
    close: () => void
    onSave: (answers: Array<{field_id: string, value: string}>) => Promise<void>
}) {
    const fields = [...form.fields].sort((a, b) => a.position - b.position)
    const [values, setValues] = useState<FormValues>(() => {
        const init: FormValues = {}
        submission?.answers.forEach(a => { init[a.form_field_id] = a.value || '' })
        return init
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const submit = async () => {
        const newErrors = validateFormValues(fields, values, lang)
        if (Object.keys(newErrors).length) { setErrors(newErrors); return }
        setSaving(true)
        await onSave(fields.map(f => ({field_id: f.id, value: values[f.id] || ''})))
        setSaving(false)
    }

    return <div className="w-[90vw] max-w-[480px] bg-background rounded-lg shadow-sm p-5 max-h-[80vh] flex flex-col">
        <div className="flex-row-item-center justify-between mb-4">
            <div className="font-semibold text-lg">{lang['My Application']}</div>
            <i className="uil-times-circle text-xl text-gray-400 cursor-pointer" onClick={close}/>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
            {editable
                ? <FormFieldsInput
                    fields={fields}
                    values={values}
                    errors={errors}
                    onChange={(id, value) => {
                        setValues(prev => ({...prev, [id]: value}))
                        if (errors[id]) setErrors(prev => ({...prev, [id]: ''}))
                    }}
                    lang={lang}/>
                : <div className="space-y-4">
                    {fields.map(field => (
                        <div key={field.id}>
                            <div className="text-xs text-gray-400 mb-1">{field.label}</div>
                            <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 min-h-[36px]">
                                <FormAnswerValue field={field} value={values[field.id] || ''}/>
                            </div>
                        </div>
                    ))}
                </div>}
        </div>

        {editable &&
            <div className="mt-4">
                <Button variant={'special'} className="w-full" onClick={submit} disabled={saving}>
                    {lang['Update Response']}
                </Button>
            </div>}
    </div>
}
