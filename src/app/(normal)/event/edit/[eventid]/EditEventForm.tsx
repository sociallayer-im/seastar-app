'use client'

import {Dictionary} from '@/lang'
import EventForm from '@/app/(normal)/event/[grouphandle]/create/EventForm'
import {CreateEventPageDataType} from '@/app/(normal)/event/[grouphandle]/create/data'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {EventDraftType, updateEvent} from '@sola/sdk'
import {RepeatFormType} from '@/app/(normal)/event/[grouphandle]/create/RepeatForm'

export default function EditEventForm(props: { lang: Dictionary, data: CreateEventPageDataType }) {
    const {showLoading, closeModal} = useModal()
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
        }
    }

    return <EventForm {...props} onConfirm={handleSave} />
}