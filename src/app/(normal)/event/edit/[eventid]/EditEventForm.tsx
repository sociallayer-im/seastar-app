'use client'

import {Dictionary} from '@/lang'
import EventForm from '@/app/(normal)/event/[grouphandle]/create/EventForm'
import {CreateEventPageDataType} from '@/app/(normal)/event/[grouphandle]/create/data'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {cancelEvent, cancelRecurringEvent, EventDraftType, updateEvent, updateRecurringEvent} from '@sola/sdk'
import {RepeatFormType} from '@/app/(normal)/event/[grouphandle]/create/RepeatForm'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {useState} from 'react'
import {Button} from '@/components/shadcn/Button'
import {CLIENT_MODE} from '@/app/config'

export default function EditEventForm(props: { lang: Dictionary, data: CreateEventPageDataType }) {
    const {showLoading, closeModal, openModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const saveSingleEvent = async (eventDraft: EventDraftType) => {
        const authToken = getAuth()
        const loading = showLoading()

        try {
            const event = await updateEvent({
                params: {eventDraft, authToken: authToken!}, clientMode: CLIENT_MODE
            })
            window.location.href = `/event/detail/${event.id}`
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to update event',
                description: e instanceof Error ? e.message : 'Unknown error',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const saveRepeatEvent = async (eventDraft: EventDraftType, repeatForm: RepeatFormType, selector: 'all' | 'after') => {
        const authToken = getAuth()
        const loading = showLoading()

        try {
            const startTimeSecondDiff = parseInt(((new Date(props.data.eventDraft.start_time).getTime() - new Date(eventDraft.start_time).getTime()) / 1000).toString())
            const endTimeSecondDiff = parseInt(((new Date(props.data.eventDraft.end_time).getTime() - new Date(eventDraft.end_time).getTime()) / 1000).toString())

            await updateRecurringEvent({
                params: {
                    eventDraft,
                    authToken: authToken!,
                    recurringId: eventDraft.recurring_id!,
                    afterEventId: selector === 'after' ? eventDraft.id! : undefined,
                    startTimeDiff: startTimeSecondDiff,
                    endTimeDiff: endTimeSecondDiff,
                }, clientMode: CLIENT_MODE
            })
            window.location.href = `/event/detail/${eventDraft.id}`
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to update event',
                description: e instanceof Error ? e.message : 'Unknown error',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const handleSave = async (eventDraft: EventDraftType, repeatForm: RepeatFormType) => {
        if (!repeatForm.interval) {
            await saveSingleEvent(eventDraft)
        } else {
            openModal({
                content: (close) => <DialogRecurringSelectorType
                    close={close!}
                    lang={props.lang}
                    onConfirm={(selector) => {
                        if (selector === 'single') {
                            saveSingleEvent(eventDraft)
                            !!close && close()
                        } else {
                            saveRepeatEvent(eventDraft, repeatForm, selector)
                            !!close && close()
                        }
                    }}/>
            })
        }
    }


    const cancelSingleEvent = async (eventDraft: EventDraftType) => {
        showConfirmDialog({
            lang: props.lang,
            title: props.lang['Cancel Event'],
            type: 'danger',
            content: 'Are you sure you want to cancel this event?',
            onConfig: async () => {
                const authToken = getAuth()
                const loading = showLoading()
                try {
                    await cancelEvent({
                        params: {eventId: eventDraft.id!, authToken: authToken!},
                        clientMode: CLIENT_MODE
                    })
                    toast({description: 'Event cancelled', variant: 'success'})
                    setTimeout(() => {
                        window.location.href = `/event/${props.data.groupDetail.handle}`
                    }, 2000)
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        title: 'Failed to cancel event',
                        description: e instanceof Error ? e.message : 'Unknown error',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const cancelRepeatEvent = async (eventDraft: EventDraftType, selector: 'all' | 'after') => {
        showConfirmDialog({
            lang: props.lang,
            title: props.lang['Cancel Event'],
            type: 'danger',
            content: 'Are you sure you want to cancel these events?',
            onConfig: async () => {
                const authToken = getAuth()
                const loading = showLoading()
                try {
                    await cancelRecurringEvent({
                        params: {
                            recurringId: eventDraft.recurring_id!,
                            afterEventId: selector === 'after' ? eventDraft.id! : undefined,
                            authToken: authToken!
                        }, clientMode: CLIENT_MODE
                    })

                    toast({description: 'Event cancelled', variant: 'success'})
                    setTimeout(() => {
                        window.location.href = `/event/${props.data.groupDetail.handle}`
                    }, 2000)
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        title: 'Failed to cancel event',
                        description: e instanceof Error ? e.message : 'Unknown error',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const handleCancel = async (eventDraft: EventDraftType, repeatForm: RepeatFormType) => {
        if (!repeatForm.interval) {
            await cancelSingleEvent(eventDraft)
        } else {
            openModal({
                content: (close) => <DialogRecurringSelectorType
                    close={close!}
                    lang={props.lang}
                    onConfirm={(selector) => {
                        if (selector === 'single') {
                            cancelSingleEvent(eventDraft)
                            !!close && close()
                        } else {
                            cancelRepeatEvent(eventDraft, selector)
                            !!close && close()
                        }
                    }}/>
            })
        }
    }

    return <EventForm {...props}
                      onConfirm={handleSave}
                      onCancel={handleCancel}
    />
}

function DialogRecurringSelectorType({lang, onConfirm, close}: {
    lang: Dictionary
    onConfirm?: (selector: 'all' | 'after' | 'single') => void,
    close: () => void
}) {
    const [selector, setSelector] = useState<'all' | 'after' | 'single'>('single')

    return <div className="w-[350px] p-3 rounded-lg bg-background shadow">
        <div className="flex-row-item-center justify-between mb-3">
            <div className="font-semibold text-lg">{lang['Select the scope of application']}</div>
            <i className="uil-times-circle text-xl text-gray-500 cursor-pointer" onClick={close}/>
        </div>
        <div>
            <div className="cursor-pointer flex-row-item-center w-full"
                 onClick={() => setSelector('single')}>
                {selector === 'single'
                    ? <i className="uil-check-circle text-green-400 text-2xl mr-1"/>
                    : <i className="uil-circle text-gray-500 text-2xl mr-1"/>
                }
                <div className='font-normal'>{lang['Only this event']}</div>
            </div>

            <div className="cursor-pointer flex-row-item-center w-full"
                 onClick={() => setSelector('after')}>
                {selector === 'after'
                    ? <i className="uil-check-circle text-green-400 text-2xl mr-1"/>
                    : <i className="uil-circle text-gray-500 text-2xl mr-1"/>
                }
                <div className='font-normal'>{lang['This event and following events']}</div>
            </div>

            <div className="cursor-pointer flex-row-item-center w-full"
                 onClick={() => setSelector('all')}>
                {selector === 'all'
                    ? <i className="uil-check-circle text-green-400 text-2xl mr-1"/>
                    : <i className="uil-circle text-gray-500 text-2xl mr-1"/>
                }
                <div className='font-normal'>{lang['All recurring events']}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
                <Button variant={'secondary'} onClick={close}>{lang['Cancel']}</Button>
                <Button variant={'primary'}
                        onClick={() => !!onConfirm && onConfirm(selector)}
                >{lang['Confirm']}</Button>
            </div>
        </div>
    </div>
}