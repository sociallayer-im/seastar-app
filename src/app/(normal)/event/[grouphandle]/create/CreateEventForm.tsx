'use client'

import EventForm from '@/app/(normal)/event/[grouphandle]/create/EventForm'
import {Dictionary} from '@/lang'
import {CreateEventPageDataType} from '@/app/(normal)/event/[grouphandle]/create/data'
import {
    createEvent,
    createRecurringEvent,
    EventDraftType,
    getEventByRecurringId,
    saveEventForm,
} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth, processEventRoles} from '@/utils'
import {RepeatFormType} from '@/app/(normal)/event/[grouphandle]/create/RepeatForm'
import {CLIENT_MODE} from '@/app/config'
import {FormFieldDraft} from '@/app/(normal)/event/[grouphandle]/create/EventForm'

export default function CreateEventForm(props: { lang: Dictionary, data: CreateEventPageDataType }) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSingleEvent = async (eventDraft: EventDraftType, formFields: FormFieldDraft[] | null) => {
        const authToken = getAuth()
        const loading = showLoading()
        try {
            const processedEventRoleDraft = await processEventRoles(eventDraft)
            const event = await createEvent({
                params: {eventDraft: processedEventRoleDraft, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            if (formFields && formFields.length > 0) {
                await saveEventForm({
                    params: {
                        eventId: event.id,
                        fields: formFields.map((f, i) => ({...f, position: i})),
                        authToken: authToken!
                    },
                    clientMode: CLIENT_MODE
                })
            }
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
            const processedEventRoleDraft = await processEventRoles(eventDraft)
            const recurring = await createRecurringEvent({
                params: {
                    eventDraft: processedEventRoleDraft,
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

    const onConfirm = async (eventDraft: EventDraftType, repeatForm: RepeatFormType, formFields: FormFieldDraft[] | null) => {
        if (!repeatForm.interval) {
            await handleSingleEvent(eventDraft, formFields)
        } else {
            await handleRepeatingEvent(eventDraft, repeatForm)
        }
    }


    return <EventForm {...props} onConfirm={onConfirm}/>
}
