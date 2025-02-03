'use client'

import {Dictionary} from '@/lang'
import EventForm from '@/app/(normal)/event/[grouphandle]/create/EventForm'
import {CreateEventPageDataType} from '@/app/(normal)/event/[grouphandle]/create/data'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {cancelEvent, EventDraftType, updateEvent} from '@sola/sdk'
import {RepeatFormType} from '@/app/(normal)/event/[grouphandle]/create/RepeatForm'
import useConfirmDialog from '@/hooks/useConfirmDialog'

export default function EditEventForm(props: { lang: Dictionary, data: CreateEventPageDataType }) {
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const saveSingleEvent = async (eventDraft: EventDraftType) => {
        const authToken = getAuth()
        const loading = showLoading()

        try {
            const event = await updateEvent({eventDraft, authToken: authToken!})
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

    const handleSave = async (eventDraft: EventDraftType, repeatForm: RepeatFormType) => {
        if (!repeatForm.interval) {
            await saveSingleEvent(eventDraft)
        } else {
            // todo: implement repeat event
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
                    await cancelEvent(eventDraft.id!, authToken!)
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
            // todo: implement cancel repeat event
        }
    }

    return <EventForm {...props}
                      onConfirm={handleSave}
                      onCancel={handleCancel}
    />
}