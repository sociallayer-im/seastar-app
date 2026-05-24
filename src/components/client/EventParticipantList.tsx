'use client'

import React from 'react'
import {getAuth, shortWalletAddress} from '@/utils'
import {Dictionary} from '@/lang'
import {cancelAttendEvent, EventDetail, ProfileDetail, Participant, checkInEventForParticipant, approveParticipant, rejectParticipant, getFormSubmission, listFormSubmissions, attendEventWithoutTicket, FormSubmission} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {CLIENT_MODE} from '@/app/config'

export interface EventParticipantListProps {
    lang: Dictionary
    eventDetail: EventDetail
    currProfile?: ProfileDetail | null
    isEventOperator?: boolean
    canViewAllSubmissions?: boolean
}

export default function EventParticipantList({
                                                 lang,
                                                 eventDetail,
                                                 currProfile,
                                                 isEventOperator,
                                                 canViewAllSubmissions
                                             }: EventParticipantListProps) {
    const {showLoading, closeModal, openModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const handleCancelParticipation = async () => {
        showConfirmDialog({
            lang,
            title: lang['Cancel Participation'],
            type: 'danger',
            content: lang['Are you sure you want to cancel your participation?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await cancelAttendEvent({
                        params: {eventId: eventDetail.id, authToken: authToken!},
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: lang['Participation cancelled'],
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } catch (e: unknown) {
                    toast({
                        description: e instanceof Error ? e.message : 'Failed to cancel participation',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const handleApproveParticipant = async (participant: Participant) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await approveParticipant({
                params: {participantId: participant.id, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            toast({description: 'Participant approved', variant: 'success'})
            setTimeout(() => window.location.reload(), 1500)
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Failed to approve',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const handleRejectParticipant = async (participant: Participant) => {
        showConfirmDialog({
            lang,
            title: lang['Reject'],
            type: 'danger',
            content: lang['Are you sure you want to reject this participant?'] || 'Are you sure you want to reject this participant?',
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await rejectParticipant({
                        params: {participantId: participant.id, authToken: authToken!},
                        clientMode: CLIENT_MODE
                    })
                    toast({description: 'Participant rejected', variant: 'success'})
                    setTimeout(() => window.location.reload(), 1500)
                } catch (e: unknown) {
                    toast({
                        description: e instanceof Error ? e.message : 'Failed to reject',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const handleCheckInForParticipant = async (participant: Participant) => {
        showConfirmDialog({
            lang,
            title: lang['Check In'],
            type: 'info',
            content: lang['Are you sure you want to check in for this participant?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await checkInEventForParticipant({
                        params: {
                            authToken: authToken!,
                            eventId: eventDetail.id,
                            participantProfileId: participant.profile.id!
                        },
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: lang['Check in successful'],
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } catch (e: unknown) {
                    toast({
                        description: e instanceof Error ? e.message : 'Failed to check in',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const handleViewApplication = async (participant: Participant) => {
        if (!eventDetail.form_id) return
        const authToken = getAuth()
        const loading = showLoading()
        try {
            const profileId = participant.profile_id ?? participant.profile.id
            const submission = await getFormSubmission({
                params: {formId: eventDetail.form_id, userId: profileId, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            closeModal(loading)
            openModal({
                content: (close) => (
                    <ApplicationAnswersDialog
                        lang={lang}
                        close={close!}
                        submission={submission || null}
                        form={eventDetail.form}
                        participant={participant}
                        onApprove={async () => { close?.(); await handleApproveParticipant(participant) }}
                        onReject={async () => { close?.(); await handleRejectParticipant(participant) }}
                    />
                )
            })
        } catch (e) {
            closeModal(loading)
            console.error(e)
        }
    }

    const handleViewMyApplication = async (participant: Participant) => {
        if (!eventDetail.form_id) return
        const authToken = getAuth()
        const loading = showLoading()
        try {
            const profileId = participant.profile_id ?? participant.profile.id
            const submission = await getFormSubmission({
                params: {formId: eventDetail.form_id, userId: profileId, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            closeModal(loading)
            openModal({
                content: (close) => (
                    <MyApplicationDialog
                        lang={lang}
                        close={close!}
                        submission={submission}
                        form={eventDetail.form}
                        participant={participant}
                        isPending={participant.status === 'pending'}
                        onUpdate={async (answers) => {
                            close?.()
                            const updLoading = showLoading()
                            try {
                                await attendEventWithoutTicket({
                                    params: {eventId: eventDetail.id, authToken: authToken!, formAnswers: answers},
                                    clientMode: CLIENT_MODE
                                })
                                toast({description: lang['Application submitted, pending approval'], variant: 'success'})
                                setTimeout(() => window.location.reload(), 1500)
                            } catch (e: unknown) {
                                toast({description: e instanceof Error ? e.message : 'Failed to update', variant: 'destructive'})
                            } finally {
                                closeModal(updLoading)
                            }
                        }}
                    />
                )
            })
        } catch (e) {
            closeModal(loading)
            console.error(e)
        }
    }

    const downloadCSV = () => {
        const title = ['Username', 'Nickname', 'Email', 'Status', 'Register time']
        const rows = eventDetail.participants?.map((item, index) => {
            return [item.profile.handle,
                item.profile.nickname || '',
                item.profile.email || '',
                item.status,
                item.created_at + 'Z'
            ]
        }) || []

        const csvContent = "data:text/csv;charset=utf-8,"
            + title.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)

        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "participants.csv")
        document.body.appendChild(link) // Required for FF
        link.click()
        link.remove()
    }

    const downloadSubmissionsCSV = async () => {
        if (!eventDetail.form_id || !eventDetail.form) return
        const loading = showLoading()
        try {
            const authToken = getAuth()
            const submissions = await listFormSubmissions({
                params: {formId: eventDetail.form_id, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            const fields = [...eventDetail.form.fields].sort((a, b) => a.position - b.position)
            const emailByProfileId = new Map<number, string>()
            eventDetail.participants?.forEach(p => {
                if (p.profile.id != null) emailByProfileId.set(p.profile.id, p.profile.email || '')
            })

            const header = ['Handle', 'Nickname', 'Email', 'Status', 'Submitted at', ...fields.map(f => f.label)]
            const rows = submissions.map(sub => {
                const answerByField = new Map(sub.answers.map(a => [a.form_field_id, a.value || '']))
                return [
                    sub.profile?.handle || '',
                    sub.profile?.nickname || '',
                    emailByProfileId.get(Number(sub.user_id)) || '',
                    sub.status,
                    sub.submitted_at || '',
                    ...fields.map(f => answerByField.get(f.id) || '')
                ]
            })

            const escapeCell = (v: string) => `"${String(v).replace(/"/g, '""')}"`
            const csv = [header, ...rows].map(r => r.map(escapeCell).join(',')).join('\n')
            const blob = new Blob(['﻿' + csv], {type: 'text/csv;charset=utf-8;'})
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'form-submissions.csv'
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Failed to download submissions',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div>
        {!!eventDetail.participants && eventDetail.participants.length > 0 && isEventOperator &&
            <div onClick={downloadCSV}
                 className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                <i className="uil-download-alt text-lg mr-1"/>
                <span>{lang['Download the list of all participants']}</span>
            </div>}

        {!!eventDetail.form_id && canViewAllSubmissions &&
            <div onClick={downloadSubmissionsCSV}
                 className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                <i className="uil-download-alt text-lg mr-1"/>
                <span>{lang['Download all form submissions']}</span>
            </div>}

        <div>
            {
                eventDetail.participants?.map(participant => {
                    return <div key={participant.id}
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                        <a className="flex-row-item-center" href={`/profile/${participant.profile.handle}`}>
                            <Avatar profile={participant.profile} className="mr-2" size={32}/>
                            <div className="text-xs">
                                <div>{participant.profile.nickname || participant.profile.handle}</div>
                                <div
                                    className="text-gray-400">{!!participant.ticket_item?.sender_address && shortWalletAddress(participant.ticket_item?.sender_address)}</div>
                                {!!participant.ticket &&
                                    <div
                                        className="text-xs text-gray-400 line-clamp-1 max-w-24">{participant.ticket.title}</div>
                                }
                            </div>
                        </a>

                        <div className="flex-row-item-center">
                            <div className="flex-col sm:flex-row items-end flex">
                                {isEventOperator && canViewAllSubmissions && eventDetail.form_id && participant.profile.id !== currProfile?.id && (
                                    <div onClick={() => handleViewApplication(participant)}
                                         className="sm:mb-0 mb-1 cursor-pointer h-7 rounded-lg px-2 ml-2 border border-blue-200 flex flex-row-item-center text-xs text-blue-500 bg-blue-50">
                                        {lang['View Application']}
                                    </div>
                                )}
                                {participant.status === 'pending' && isEventOperator && <>
                                    <div onClick={() => handleApproveParticipant(participant)}
                                         className="sm:mb-0 mb-1 cursor-pointer h-7 rounded-lg px-2 ml-2 border border-green-300 flex flex-row-item-center text-xs text-green-600 bg-green-50 font-semibold">
                                        {lang['Accept to join']}
                                    </div>
                                    <div onClick={() => handleRejectParticipant(participant)}
                                         className="sm:mb-0 mb-1 cursor-pointer h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-gray-600">
                                        {lang['Reject']}
                                    </div>
                                </>}
                                {participant.status === 'pending' && !isEventOperator &&
                                    <div className="h-7 rounded-lg px-2 ml-2 border border-yellow-300 flex flex-row-item-center text-xs text-yellow-600 bg-yellow-50">
                                        {lang['Pending']}
                                    </div>
                                }
                                {participant.profile.id === currProfile?.id && eventDetail.form_id && participant.status !== 'rejected' &&
                                    <div onClick={() => handleViewMyApplication(participant)}
                                         className="sm:mb-0 mb-1 cursor-pointer h-7 rounded-lg px-2 ml-2 border border-blue-200 flex flex-row-item-center text-xs text-blue-500 bg-blue-50">
                                        {participant.status === 'pending' ? lang['Edit Application'] : lang['View Application']}
                                    </div>
                                }
                                {participant.profile.id === currProfile?.id && participant.status !== 'pending' && participant.status !== 'rejected' &&
                                    <div onClick={handleCancelParticipation}
                                         className="sm:mb-0 mb-1 cursor-pointer h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-red-400">
                                        {lang['Cancel Participation']}
                                    </div>
                                }
                                {isEventOperator && participant.status !== 'checked' && participant.status !== 'pending' && participant.status !== 'rejected' &&
                                    <div onClick={() => handleCheckInForParticipant(participant)}
                                         className="cursor-pointer h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-white bg-black font-semibold">
                                        {lang['Check In']}
                                    </div>
                                }
                                {participant.status === 'checked' &&
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs  bg-gray-50 font-semibold">
                                        {lang['Checked']}
                                    </div>
                                }
                                {participant.status === 'rejected' &&
                                    <div className="h-7 rounded-lg px-2 ml-2 border border-red-200 flex flex-row-item-center text-xs text-red-500 bg-red-50">
                                        {lang['Rejected']}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

function MyApplicationDialog({lang, close, submission, form, participant, isPending, onUpdate}: {
    lang: Dictionary
    close: () => void
    submission: FormSubmission | null
    form: EventDetail['form']
    participant: Participant
    isPending: boolean
    onUpdate: (answers: Array<{field_id: string, value: string}>) => Promise<void>
}) {
    const [values, setValues] = React.useState<Record<string, string>>(() => {
        const init: Record<string, string> = {}
        submission?.answers.forEach(a => { init[a.form_field_id] = a.value || '' })
        return init
    })
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [submitting, setSubmitting] = React.useState(false)

    const handleSubmit = async () => {
        if (!form) return
        const newErrors: Record<string, string> = {}
        form.fields.forEach(field => {
            if (field.required && !values[field.id]?.trim()) {
                newErrors[field.id] = lang['This field is required'] || 'This field is required'
            }
        })
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
        setSubmitting(true)
        await onUpdate(form.fields.map(f => ({field_id: f.id, value: values[f.id] || ''})))
        setSubmitting(false)
    }

    return (
        <div className="w-[90vw] max-w-[480px] bg-background rounded-lg shadow p-5 max-h-[80vh] flex flex-col">
            <div className="flex-row-item-center justify-between mb-4">
                <div className="font-semibold text-lg">{lang['Application Form']}</div>
                <i className="uil-times-circle text-xl text-gray-400 cursor-pointer" onClick={close}/>
            </div>
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {!submission && !form?.fields.length && (
                    <div className="text-sm text-gray-400">{lang['No answers submitted'] || 'No answers submitted'}</div>
                )}
                {form?.fields.map(field => (
                    <div key={field.id}>
                        <div className="text-sm font-medium mb-1">
                            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        {isPending ? (
                            <>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                                    value={values[field.id] || ''}
                                    onChange={e => {
                                        setValues({...values, [field.id]: e.target.value})
                                        if (errors[field.id]) setErrors({...errors, [field.id]: ''})
                                    }}
                                />
                                {errors[field.id] && <div className="text-xs text-red-500 mt-1">{errors[field.id]}</div>}
                            </>
                        ) : (
                            <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 min-h-[36px]">
                                {values[field.id] || <span className="text-gray-300">—</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {isPending && (
                <div className="mt-4">
                    <button
                        className="w-full h-9 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {lang['Update Application'] || 'Update Application'}
                    </button>
                </div>
            )}
        </div>
    )
}

function ApplicationAnswersDialog({lang, close, submission, form, participant, onApprove, onReject}: {
    lang: Dictionary
    close: () => void
    submission: FormSubmission | null
    form: EventDetail['form']
    participant: Participant
    onApprove: () => Promise<void>
    onReject: () => Promise<void>
}) {
    return (
        <div className="w-[90vw] max-w-[480px] bg-background rounded-lg shadow p-5 max-h-[80vh] flex flex-col">
            <div className="flex-row-item-center justify-between mb-4">
                <div className="flex-row-item-center gap-2">
                    <img src={participant.profile.image_url || '/images/default_avatar.png'}
                         className="w-8 h-8 rounded-full object-cover" alt=""/>
                    <div>
                        <div className="font-semibold text-sm">{participant.profile.nickname || participant.profile.handle}</div>
                        <div className="text-xs text-gray-400">@{participant.profile.handle}</div>
                    </div>
                </div>
                <i className="uil-times-circle text-xl text-gray-400 cursor-pointer" onClick={close}/>
            </div>

            <div className="font-semibold text-sm mb-3">{lang['Application Answers']}</div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {!submission && (
                    <div className="text-sm text-gray-400">{lang['No answers submitted'] || 'No answers submitted'}</div>
                )}
                {submission && form?.fields.map(field => {
                    const answer = submission.answers.find(a => a.form_field_id === field.id)
                    return (
                        <div key={field.id}>
                            <div className="text-xs text-gray-400 mb-1">{field.label}{field.required && ' *'}</div>
                            <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 min-h-[36px]">
                                {answer?.value || <span className="text-gray-300">—</span>}
                            </div>
                        </div>
                    )
                })}
            </div>

            {participant.status === 'pending' ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                        className="h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                        onClick={onReject}
                    >
                        {lang['Reject']}
                    </button>
                    <button
                        className="h-9 rounded-lg border border-green-300 bg-green-50 text-sm text-green-600 font-semibold hover:bg-green-100"
                        onClick={onApprove}
                    >
                        {lang['Accept to join']}
                    </button>
                </div>
            ) : (
                <div className="mt-4">
                    <button
                        className="w-full h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                        onClick={close}
                    >
                        {lang['Close'] || 'Close'}
                    </button>
                </div>
            )}
        </div>
    )
}
