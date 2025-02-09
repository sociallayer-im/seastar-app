'use client'

import EventForm from '@/app/(normal)/event/[grouphandle]/create/EventForm'
import {Dictionary} from '@/lang'
import {CreateEventPageDataType} from '@/app/(normal)/event/[grouphandle]/create/data'
import {createEvent, createRecurringEvent, EventDraftType, getEventByRecurringId} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {RepeatFormType} from '@/app/(normal)/event/[grouphandle]/create/RepeatForm'
import {CLIENT_MODE} from '@/app/config'

export default function CreateEventForm(props: { lang: Dictionary, data: CreateEventPageDataType }) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSingleEvent = async (eventDraft: EventDraftType) => {
        const authToken = getAuth()
        const loading = showLoading()
        try {
            const event = await createEvent({
                params: {eventDraft, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            window.location.href = `/event/share/${event.id}`
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to create event',
                description: e instanceof Error ? e.message : 'Unknown error',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const handleRepeatingEvent = async (eventDraft: EventDraftType, repeatForm: RepeatFormType) => {
        const authToken = getAuth()
        const loading = showLoading()
        try {
            const recurring = await createRecurringEvent({
                params: {
                    eventDraft,
                    authToken: authToken!,
                    eventCount: repeatForm.event_count!,
                    interval: repeatForm.interval!
                }, clientMode: CLIENT_MODE
            })

            const events = await getEventByRecurringId({
                params: {recurringId: recurring.id},
                clientMode: CLIENT_MODE
            })

            window.location.href = `/event/share/${events[0]?.id}`
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to create event',
                description: e instanceof Error ? e.message : 'Unknown error',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const onConfirm = async (eventDraft: EventDraftType, repeatForm: RepeatFormType) => {
        if (!repeatForm.interval) {
            await handleSingleEvent(eventDraft)
        } else {
            await handleRepeatingEvent(eventDraft, repeatForm)
        }
    }


    return <EventForm {...props} onConfirm={onConfirm}/>

}