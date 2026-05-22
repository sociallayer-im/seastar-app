'use client'

import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {attendEventWithoutTicket, EventForm} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {useState} from 'react'

export default function AttendEventBtn({eventId, lang, className, onAttended, form, requireApproval}: {
    eventId: number,
    lang: Dictionary,
    className?: string
    onAttended?: () => void
    form?: EventForm | null
    requireApproval?: boolean
}) {
    const {showLoading, closeModal, openModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const doAttend = async (formAnswers?: Array<{field_id: string, value: string}>) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await attendEventWithoutTicket({
                params: {
                    eventId,
                    authToken: authToken!,
                    formAnswers
                },
                clientMode: CLIENT_MODE
            })
            toast({
                title: (form && requireApproval) ? lang['Application submitted, pending approval'] : lang['Attending event'] || 'Attending event',
                variant: 'success'
            })
            if (onAttended) {
                onAttended()
            } else {
                window.setTimeout(() => window.location.reload(), 2000)
            }
        } catch (e: unknown) {
            console.error('[handleAttendEvent]: ', e)
            const message = e instanceof Error ? e.message : 'Failed to attend event'
            if (message.includes('group membership required for Edge Esmeralda')) {
                showConfirmDialog({
                    lang,
                    title: 'Join Event',
                    content: 'Please purchase the ticket to join the event. <br /><a style="color: #097eff; text-decoration: underline; white-space: nowrap;" href="https://edgecity.simplefi.tech/auth?popup=edge-esmeralda" target="_blank">Go to Purchase Ticket</a>',
                    type: 'info'
                })
                return
            }
            toast({title: message, variant: 'destructive'})
        } finally {
            closeModal(loading)
        }
    }

    const handleClick = () => {
        if (form && form.fields.length > 0) {
            openModal({
                content: (close) => (
                    <ApplicationFormDialog
                        form={form}
                        lang={lang}
                        close={close!}
                        onSubmit={async (answers) => {
                            close?.()
                            await doAttend(answers)
                        }}
                    />
                )
            })
        } else if (requireApproval) {
            showConfirmDialog({
                lang,
                title: lang['Join Event(RSVP)'],
                type: 'info',
                content: lang['This event requires approval. Your request will be reviewed by the organizer.'] || 'This event requires approval. Your request will be reviewed by the organizer.',
                onConfig: async () => { await doAttend() }
            })
        } else {
            doAttend()
        }
    }

    return (
        <Button variant={'special'} onClick={handleClick} className={className}>
            <span>{lang['Join Event(RSVP)']}</span>
        </Button>
    )
}

function ApplicationFormDialog({form, lang, close, onSubmit}: {
    form: EventForm
    lang: Dictionary
    close: () => void
    onSubmit: (answers: Array<{field_id: string, value: string}>) => Promise<void>
}) {
    const [values, setValues] = useState<Record<string, string>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    const handleFieldChange = (id: string, value: string) => {
        setValues(prev => ({...prev, [id]: value}))
        if (errors[id]) setErrors(prev => ({...prev, [id]: ''}))
    }

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {}
        form.fields.forEach(field => {
            if (field.required && !values[field.id]?.trim()) {
                newErrors[field.id] = lang['This field is required'] || 'This field is required'
            }
        })
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        setSubmitting(true)
        await onSubmit(form.fields.map(f => ({field_id: f.id, value: values[f.id] || ''})))
        setSubmitting(false)
    }

    return (
        <div className="w-[90vw] max-w-[480px] bg-background rounded-lg shadow p-5 max-h-[80vh] flex flex-col">
            <div className="flex-row-item-center justify-between mb-4">
                <div className="font-semibold text-lg">{lang['Application Form']}</div>
                <i className="uil-times-circle text-xl text-gray-400 cursor-pointer" onClick={close}/>
            </div>
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {form.fields.map(field => (
                    <div key={field.id}>
                        <div className="text-sm font-medium mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        {field.field_type === 'select' ? (
                            <select
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 bg-white"
                                value={values[field.id] || ''}
                                onChange={e => handleFieldChange(field.id, e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {(field.options || []).map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                                placeholder={field.label}
                                value={values[field.id] || ''}
                                onChange={e => handleFieldChange(field.id, e.target.value)}
                            />
                        )}
                        {errors[field.id] && (
                            <div className="text-xs text-red-500 mt-1">{errors[field.id]}</div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <Button
                    variant={'special'}
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {lang['Submit Application']}
                </Button>
            </div>
        </div>
    )
}
