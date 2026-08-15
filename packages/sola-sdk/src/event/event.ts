import {
    Event,
    EventDetail,
    EventDraftType,
    EventForm,
    EventRole,
    EventWithJoinStatus,
    FormSubmission,
    Participant,
    Recurring,
    TicketDraft
} from './types'
import {getSdkConfig} from '../client'
import {request, requestOrNull, requestAllPages, Paginated} from '../request'
import {SolaSdkFunctionParams} from '../types'
import {resolvePlaceId} from '../place'

export const sortEventsByTime = (a: Event, b: Event): number => {
    const now = new Date().getTime()
    const aStartTime = new Date(a.start_time).getTime()
    const aEndTime = new Date(a.end_time).getTime()
    const bStartTime = new Date(b.start_time).getTime()
    const bEndTime = new Date(b.end_time).getTime()

    // 判断活动状态
    const aIsOngoing = aStartTime <= now && now <= aEndTime
    const bIsOngoing = bStartTime <= now && now <= bEndTime
    const aIsFuture = aStartTime > now
    const bIsFuture = bStartTime > now

    // 正在进行中的活动排在顶部
    if (aIsOngoing && !bIsOngoing) return -1
    if (!aIsOngoing && bIsOngoing) return 1

    // 如果都是正在进行中的活动，按开始时间升序排列
    if (aIsOngoing && bIsOngoing) {
        return aStartTime - bStartTime
    }

    // 未来活动排在已结束活动前面
    if (aIsFuture && !bIsFuture) return -1
    if (!aIsFuture && bIsFuture) return 1

    // 如果都是未来活动，按时间升序排列（早的在前）
    if (aIsFuture && bIsFuture) {
        return aStartTime - bStartTime
    }

    // 如果都是已结束活动，按结束时间降序排列（最近结束的在前）
    return bEndTime - aEndTime
}

export type EventCollectionType = "upcoming" | "past" | "ongoing" | undefined

/** Filter params for GET /events (soon browse listing). */
export type EventListFilterProps = {
    group_id?: string,           // TSID or group slug
    collection?: EventCollectionType,
    timezone?: string,
    start_date?: string,
    end_date?: string,
    search_title?: string,
    tags?: string[],
    venue_id?: string,
    track_id?: string,
    kind?: string,
    category?: string,
    pinned?: string | number,
    skip_recurring?: string | number,
    owner_id?: string,           // TSID or username — events a user hosts
    attendee_id?: string,        // TSID or username — events a user attends
    co_host_id?: string,         // TSID or username — events with this user as an EventRole item
    starred_id?: string,         // TSID or username — events this user has starred
    page?: number,
}

/**
 * Browse/schedule listing. Public; pass authToken to get
 * is_attending/is_starred/is_owner flags on each event.
 */
export const getEvents = async ({params: {filters, authToken, limit, noCache}, clientMode}: SolaSdkFunctionParams<{
    filters: EventListFilterProps,
    authToken?: string,
    limit?: number
    /** Defaults true (always fresh). Pass false to allow soon's own
     *  Cache-Control (public, anonymous-only) to govern via the standard
     *  fetch cache — not Next.js's fetch cache — for high-traffic public
     *  reads like the schedule views. */
    noCache?: boolean
}>) => {
    const res = await request<Paginated<EventWithJoinStatus>>('/events', {
        params: {...filters, limit: limit || 100},
        authToken,
        clientMode,
        noCache: noCache ?? true
    })
    return res.data
}

export const getEventDetailById = async ({params: {eventId, authToken, includeParticipants}, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken?: string
    /** Pass false to leave the attendee array out of the response. It grows
     *  with every RSVP and the detail page keeps it behind a tab, so the page
     *  asks for it separately via getEventParticipants. `current_participant`
     *  comes back either way. */
    includeParticipants?: boolean
}>) => {
    const query = includeParticipants === false ? '?include_participants=false' : ''
    return await requestOrNull<EventDetail>(`/events/${eventId}${query}`, {authToken, clientMode, noCache: true})
}

/**
 * The attendee list.
 *
 * Paged through to the end: the embedded array this replaces was
 * unpaginated, so stopping at the first page would quietly shorten the list
 * for exactly the large events where fetching it separately is worth doing.
 */
export const getEventParticipants = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: string
    authToken?: string
}>) => {
    return await requestAllPages<Participant>(`/events/${eventId}/participants`, {
        authToken, clientMode, noCache: true
    })
}

/** Events pending the caller's review (manager dashboard inbox). */
export const getMyPendingApprovalEvent = async ({params: {authToken}, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    if (!authToken) {
        throw new Error('authToken is required')
    }
    try {
        const res = await request<Paginated<Event>>('/events/pending_approval', {
            authToken, clientMode, noCache: true
        })
        return res.data.sort(sortEventsByTime).slice(0, 30)
    } catch (e: unknown) {
        console.error(e)
        return []
    }
}

/**
 * The events a user has starred. Backed by GET /events?starred_id=, a single
 * query (Comment star rows joined against Event) — previously this resolved
 * the caller via /users/me, listed up to 30 star comments, then fetched each
 * referenced event individually (N+1, and silently dropped anything that
 * 404'd), all now folded into one filtered listing on the backend.
 */
export const getStaredEvent = async ({params: {name, authToken}, clientMode}: SolaSdkFunctionParams<{
    name: string,
    authToken?: string
}>) => {
    try {
        const events = await getEvents({params: {filters: {starred_id: name}, authToken}, clientMode})
        return events.sort(sortEventsByTime)
    } catch (e: unknown) {
        console.error(e)
        return []
    }
}

/** Profile-page event tabs: hosting/attended/co-hosting/starred, each a GET /events filter. */
export const getProfileEventByName = async ({params: {name, authToken}, clientMode}: SolaSdkFunctionParams<{
    name: string,
    authToken?: string
}>) => {
    const fetchWith = async (filters: EventListFilterProps): Promise<Event[]> => {
        try {
            return await getEvents({params: {filters, authToken}, clientMode})
        } catch {
            return []
        }
    }

    const [attends, hosting, coHosting, starred] = await Promise.all([
        fetchWith({attendee_id: name}),
        fetchWith({owner_id: name}),
        fetchWith({co_host_id: name}),
        fetchWith({starred_id: name}),
    ])

    return {
        attends: attends.sort(sortEventsByTime),
        hosting: hosting.sort(sortEventsByTime),
        coHosting: coHosting.sort(sortEventsByTime),
        starred: starred.sort(sortEventsByTime),
    }
}

export const getGroupEventByName = async ({params: {name, collection}, clientMode}: SolaSdkFunctionParams<{
    name: string,
    collection?: EventCollectionType
}>) => {
    try {
        const res = await request<Paginated<Event>>('/events', {
            params: {group_id: name, collection: collection || 'past', limit: 100},
            clientMode
        })
        return res.data
    } catch {
        return [] as Event[]
    }
}

/** Calendar-subscription links for a group's public .ics feed. */
export const getEventIcsUrl = ({params: {groupIdOrName}, clientMode}: SolaSdkFunctionParams<{
    groupIdOrName: string
}>) => {
    const url = `${getSdkConfig(clientMode).api}/api/v1/groups/${encodeURIComponent(groupIdOrName)}/calendar.ics`
    const googleCalendarLink = `https://www.google.com/calendar/render?cid=${encodeURIComponent(url.replace('https', 'http'))}`
    const outlookCalendarLink = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(url)}`
    const systemCalendarLink = url.replace(/^https?/, 'webcal')

    return {
        url,
        googleCalendarLink,
        outlookCalendarLink,
        systemCalendarLink
    }
}

/** A single event's .ics (importable into any calendar). */
export const getSingleEventIcsUrl = ({params: {eventId}, clientMode}: SolaSdkFunctionParams<{
    eventId: string
}>) => {
    return `${getSdkConfig(clientMode).api}/api/v1/events/${eventId}/calendar.ics`
}

export const sendEventFeedback = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    feedback: string,
    authToken: string
}>) => {
    await request('/comments', {
        method: 'POST',
        body: {
            comment: {
                comment_type: 'feedback',
                item_type: 'Event',
                item_id: params.eventId,
                content: params.feedback,
                content_type: 'text'
            }
        },
        authToken: params.authToken,
        clientMode
    })
}

export const attendEventWithoutTicket = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string,
    formAnswers?: Array<{ field_id: string, value: string }>
}>) => {
    return await request<Participant>(`/events/${params.eventId}/participants`, {
        method: 'POST',
        body: {
            participant: {status: 'attending'},
            ...(params.formAnswers ? {form_answers: params.formAnswers} : {})
        },
        authToken: params.authToken,
        clientMode
    })
}

/** Leave an event: find own participant record and delete it. */
export const cancelAttendEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    const me = await request<{ id: string }>('/users/me', {authToken, clientMode, noCache: true})
    let page = 1
    for (; ;) {
        const res = await request<Paginated<Participant>>(`/events/${eventId}/participants`, {
            params: {page, limit: 100}, authToken, clientMode, noCache: true
        })
        const mine = res.data.find(p => p.user?.id === me.id)
        if (mine) {
            await request(`/events/${eventId}/participants/${mine.id}`, {
                method: 'DELETE', authToken, clientMode
            })
            return
        }
        if (!res.meta.next_page) break
        page = res.meta.next_page
    }
    throw new Error('You are not attending this event')
}

/**
 * Withdraw a participant record we already have the id of — which the event
 * page does, from `current_participant`.
 *
 * `cancelAttendEvent` above pages the whole attendee list to find the same
 * row; prefer this one wherever the id is already in hand. The API soft-
 * deletes: the row survives as `cancelled` (so a paid order stays refundable)
 * and re-registering later reuses it.
 */
export const cancelParticipant = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    participantId: string,
    authToken: string
}>) => {
    await request(`/events/${params.eventId}/participants/${params.participantId}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}

// --- forms (keyed by event, not form) ---

export const saveEventForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    title?: string,
    fields: Array<{
        id?: string,
        label: string,
        field_type: string,
        required: boolean,
        for_admin?: boolean,
        position: number,
        options?: string[]
    }>,
    authToken: string
}>) => {
    return await request<EventForm>(`/events/${params.eventId}/form`, {
        method: 'POST',
        body: {title: params.title, fields: params.fields},
        authToken: params.authToken,
        clientMode
    })
}

export const clearEventForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    await request(`/events/${params.eventId}/form`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode
    })
}

export const getEventForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken?: string
}>) => {
    const data = await request<EventForm | { form: null }>(`/events/${params.eventId}/form`, {
        authToken: params.authToken, clientMode, noCache: true
    })
    if (!data || (data as any).form === null) return null
    return data as EventForm
}

export const getFormSubmission = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    userId: string,
    authToken: string
}>) => {
    const data = await request<FormSubmission | { submission: null }>(`/events/${params.eventId}/form/submission`, {
        params: {user_id: params.userId},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
    if (!data || (data as any).submission === null) return null
    return data as FormSubmission
}

export const listFormSubmissions = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    return await request<FormSubmission[]>(`/events/${params.eventId}/form/submissions`, {
        authToken: params.authToken, clientMode, noCache: true
    })
}

// --- event create/update orchestration ---

// Only these keys go into the {event: {...}} payload; roles/tickets/location
// are handled by their own endpoints. image_url (cover) and notes are set in the
// editor and must round-trip. pinned is sent too but the API only honors it for
// group managers (non-managers can't feature their own event).
const eventBody = (draft: EventDraftType, placeId: string | null) => ({
    title: draft.title,
    content: draft.content,
    notes: draft.notes,
    image_url: draft.image_url,
    image_note: draft.image_note,
    pinned: draft.pinned,
    start_time: draft.start_time,
    end_time: draft.end_time,
    timezone: draft.timezone,
    status: draft.status,
    visibility: draft.visibility,
    place_id: placeId,
    venue_id: draft.venue_id,
    track_id: draft.track_id,
    meeting_url: draft.meeting_url,
    external_url: draft.external_url,
    max_participant: draft.max_participant,
    require_approval: draft.require_approval,
    category: draft.category,
    kind: draft.kind,
    tags: draft.tags || [],
    requirement_tags: draft.requirement_tags || []
})

const createEventRoles = async (eventId: string, roles: EventRole[], authToken: string, clientMode?: any) => {
    for (const role of roles) {
        if (role._destroy) continue
        await request(`/events/${eventId}/event_roles`, {
            method: 'POST',
            body: {
                event_role: {
                    item_id: role.item_id,
                    item_type: role.item_type,
                    role: role.role,
                    email: role.email,
                    display_name: role.display_name,
                    image_url: role.image_url
                }
            },
            authToken,
            clientMode
        })
    }
}

const ticketBody = (t: TicketDraft, groupId: string | null) => ({
    title: t.title,
    content: t.content,
    check_badge_class_id: t.check_badge_class_id,
    check_group_ids: t.check_group_ids || [],
    quantity: t.quantity,
    end_time: t.end_time,
    need_approval: t.need_approval,
    status: t.status,
    ticket_type: t.ticket_type,
    group_id: groupId,
    start_date: t.start_date,
    end_date: t.end_date,
    days_allowed: t.days_allowed || [],
    tracks_allowed: t.tracks_allowed || [],
    payment_methods_attributes: (t.payment_methods || []).map(pm => ({
        id: pm.id,
        _destroy: pm._destroy,
        chain: pm.chain,
        kind: pm.kind,
        token_name: pm.token_name,
        token_address: pm.token_address,
        receiver_address: pm.receiver_address,
        price: pm.price,
        protocol: pm.protocol,
        chains: pm.chains,
        currency: pm.currency,
        stripe_setting_id: pm.stripe_setting_id
    }))
})

const createEventTickets = async (eventId: string, tickets: TicketDraft[], groupId: string | null, authToken: string, clientMode?: any) => {
    for (const t of tickets) {
        if (t._destroy) continue
        await request(`/events/${eventId}/tickets`, {
            method: 'POST',
            body: {ticket: ticketBody(t, groupId)},
            authToken,
            clientMode
        })
    }
}

/**
 * Diff draft tickets against the server's and create/update/delete to match,
 * mirroring syncEventRoles. The API retires sold-out tickets (status→inactive)
 * on DELETE rather than destroying them, so removing a ticket that already has
 * buyers is safe.
 */
const syncEventTickets = async (eventId: string, draftTickets: TicketDraft[], groupId: string | null, authToken: string, clientMode?: any) => {
    for (const t of draftTickets) {
        if (t.id && t._destroy) {
            await request(`/events/${eventId}/tickets/${t.id}`, {
                method: 'DELETE', authToken, clientMode
            })
        } else if (t.id) {
            await request(`/events/${eventId}/tickets/${t.id}`, {
                method: 'PATCH',
                body: {ticket: ticketBody(t, groupId)},
                authToken, clientMode
            })
        } else if (!t._destroy) {
            await createEventTickets(eventId, [t], groupId, authToken, clientMode)
        }
    }

    // Tickets dropped from the draft entirely (no _destroy marker) are deleted too.
    // (tickets#index is paginated; a single event never has more than a handful
    // of ticket types, so one generous page covers it.)
    const draftIds = new Set(draftTickets.filter(t => t.id && !t._destroy).map(t => t.id))
    const existingRes = await request<Paginated<{ id: string }>>(`/events/${eventId}/tickets`, {
        params: {limit: 200}, authToken, clientMode, noCache: true
    })
    for (const ticket of existingRes.data) {
        if (ticket.id && !draftIds.has(ticket.id) && !draftTickets.some(t => t.id === ticket.id)) {
            await request(`/events/${eventId}/tickets/${ticket.id}`, {
                method: 'DELETE', authToken, clientMode
            })
        }
    }
}

/** Diff draft roles against the server's and create/update/delete to match. */
const syncEventRoles = async (eventId: string, draftRoles: EventRole[], authToken: string, clientMode?: any) => {
    const existing = await request<EventRole[]>(`/events/${eventId}/event_roles`, {
        authToken, clientMode, noCache: true
    })

    for (const role of draftRoles) {
        if (role.id && role._destroy) {
            await request(`/events/${eventId}/event_roles/${role.id}`, {
                method: 'DELETE', authToken, clientMode
            })
        } else if (role.id) {
            await request(`/events/${eventId}/event_roles/${role.id}`, {
                method: 'PATCH',
                body: {
                    event_role: {
                        item_id: role.item_id,
                        item_type: role.item_type,
                        role: role.role,
                        email: role.email,
                        display_name: role.display_name,
                        image_url: role.image_url
                    }
                },
                authToken, clientMode
            })
        } else if (!role._destroy) {
            await createEventRoles(eventId, [role], authToken, clientMode)
        }
    }

    // Roles removed from the draft entirely (no _destroy marker) are deleted too.
    const draftIds = new Set(draftRoles.filter(r => r.id && !r._destroy).map(r => r.id))
    for (const role of existing) {
        if (role.id && !draftIds.has(role.id) && !draftRoles.some(r => r.id === role.id)) {
            await request(`/events/${eventId}/event_roles/${role.id}`, {
                method: 'DELETE', authToken, clientMode
            })
        }
    }
}

export const createEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventDraft: EventDraftType,
    authToken: string
}>) => {
    const placeId = await resolvePlaceId({params: {...params.eventDraft, authToken: params.authToken}, clientMode})

    // Roles and tickets are sent inline so the API commits the whole event in one
    // transaction. This is atomic (a bad ticket rolls the event back) and
    // retry-safe (a failure leaves no partial event for a retry to duplicate).
    const roles = (params.eventDraft.event_roles || [])
        .filter(r => !r._destroy)
        .map(r => ({
            item_id: r.item_id,
            item_type: r.item_type,
            role: r.role,
            email: r.email,
            display_name: r.display_name,
            image_url: r.image_url
        }))
    const tickets = (params.eventDraft.tickets || [])
        .filter(t => !t._destroy)
        .map(t => ticketBody(t, params.eventDraft.group_id ?? null))

    return await request<Event>('/events', {
        method: 'POST',
        body: {
            event: {...eventBody(params.eventDraft, placeId), group_id: params.eventDraft.group_id},
            ...(roles.length ? {event_roles: roles} : {}),
            ...(tickets.length ? {tickets} : {}),
            // Group-level state, so the API gates it on group-manager rights
            // and ignores it for anyone else. Omitted entirely when undefined
            // so an ordinary save never clears an existing designation.
            ...(params.eventDraft.is_group_ticket_event === undefined
                ? {} : {is_group_ticket_event: params.eventDraft.is_group_ticket_event})
        },
        authToken: params.authToken,
        clientMode
    })
}

export const updateEvent = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventDraft: EventDraftType,
    authToken: string
}>) => {
    if (!params.eventDraft.id) {
        throw new Error('eventDraft.id is required')
    }
    const placeId = await resolvePlaceId({params: {...params.eventDraft, authToken: params.authToken}, clientMode})

    const event = await request<Event>(`/events/${params.eventDraft.id}`, {
        method: 'PATCH',
        body: {
            event: eventBody(params.eventDraft, placeId),
            ...(params.eventDraft.is_group_ticket_event === undefined
                ? {} : {is_group_ticket_event: params.eventDraft.is_group_ticket_event})
        },
        authToken: params.authToken,
        clientMode
    })

    if (params.eventDraft.event_roles) {
        await syncEventRoles(event.id, params.eventDraft.event_roles, params.authToken, clientMode)
    }
    if (params.eventDraft.tickets) {
        await syncEventTickets(event.id, params.eventDraft.tickets, params.eventDraft.group_id ?? null, params.authToken, clientMode)
    }

    return event
}

/** Soft-cancels the event (status → cancelled; attendees get a CANCEL .ics). */
export const cancelEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    await request(`/events/${eventId}`, {method: 'DELETE', authToken, clientMode})
}

// --- venue conflict ---

export type GetOccupiedTimeEventProps = {
    startTime: string,
    endTime: string,
    timezone: string,
    venueId: string | null,
    excludeEventId?: string
}

export const getOccupiedTimeEvent = async ({
    params: {startTime, endTime, venueId, excludeEventId},
    clientMode
}: SolaSdkFunctionParams<GetOccupiedTimeEventProps>) => {
    if (!venueId) return null
    const data = await request<{ event: Event | null }>(`/venues/${venueId}/conflict`, {
        params: {start_time: startTime, end_time: endTime, exclude_event_id: excludeEventId},
        clientMode,
        noCache: true
    })
    return data.event
}

// --- participant management ---

export const checkInEventForParticipant = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    eventId: string,
    userId: string
}>) => {
    return await request<Participant>(`/events/${params.eventId}/participants/check_in`, {
        method: 'POST',
        body: {user_id: params.userId},
        authToken: params.authToken,
        clientMode
    })
}

export const approveParticipant = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    participantId: string,
    authToken: string
}>) => {
    return await request<Participant>(`/events/${params.eventId}/participants/${params.participantId}/approve`, {
        method: 'POST',
        authToken: params.authToken,
        clientMode
    })
}

export const rejectParticipant = async ({params, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    participantId: string,
    authToken: string
}>) => {
    return await request<Participant>(`/events/${params.eventId}/participants/${params.participantId}/reject`, {
        method: 'POST',
        authToken: params.authToken,
        clientMode
    })
}

// --- recurring events ---

export interface CreateRecurringEventParams {
    eventDraft: EventDraftType,
    authToken: string,
    eventCount: number,
    interval: 'day' | 'week' | 'month' | string,
}

export const createRecurringEvent = async ({params, clientMode}: SolaSdkFunctionParams<CreateRecurringEventParams>) => {
    const placeId = await resolvePlaceId({params: {...params.eventDraft, authToken: params.authToken}, clientMode})
    const d = params.eventDraft

    // /recurring takes flat params (not wrapped in {event}).
    return await request<Recurring>('/recurring', {
        method: 'POST',
        body: {
            group_id: d.group_id,
            interval: params.interval,
            event_count: params.eventCount,
            timezone: d.timezone,
            start_time: d.start_time,
            end_time: d.end_time,
            venue_id: d.venue_id,
            title: d.title,
            content: d.content,
            status: d.status,
            visibility: d.visibility,
            place_id: placeId,
            track_id: d.track_id,
            meeting_url: d.meeting_url,
            external_url: d.external_url,
            max_participant: d.max_participant,
            require_approval: d.require_approval,
            category: d.category,
            kind: d.kind,
            tags: d.tags || [],
            requirement_tags: d.requirement_tags || []
        },
        authToken: params.authToken,
        clientMode
    })
}

export const getRecurringById = async ({params: {recurringId}, clientMode}: SolaSdkFunctionParams<{
    recurringId: string
}>) => {
    return await requestOrNull<Recurring>(`/recurring/${recurringId}`, {clientMode, noCache: true})
}

export const getEventByRecurringId = async ({params: {recurringId}, clientMode}: SolaSdkFunctionParams<{
    recurringId: string
}>) => {
    const recurring = await getRecurringById({params: {recurringId}, clientMode})
    return (recurring?.events || [])
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
}

export type UpdateRecurringEventProps = {
    eventDraft: EventDraftType,
    recurringId: string,
    authToken: string,
    afterEventId?: string
    startTimeDiff: number
    endTimeDiff: number
}

export const updateRecurringEvent = async ({
    params: {startTimeDiff, endTimeDiff, eventDraft, recurringId, afterEventId, authToken},
    clientMode
}: SolaSdkFunctionParams<UpdateRecurringEventProps>) => {
    const placeId = await resolvePlaceId({params: {...eventDraft, authToken}, clientMode})

    await request(`/recurring/${recurringId}`, {
        method: 'PATCH',
        body: {
            selector: afterEventId ? 'after' : 'all',
            after_event_id: afterEventId,
            start_time_diff: startTimeDiff,
            end_time_diff: endTimeDiff,
            venue_id: eventDraft.venue_id,
            title: eventDraft.title,
            content: eventDraft.content,
            timezone: eventDraft.timezone,
            status: eventDraft.status,
            visibility: eventDraft.visibility,
            place_id: placeId,
            track_id: eventDraft.track_id,
            meeting_url: eventDraft.meeting_url,
            external_url: eventDraft.external_url,
            max_participant: eventDraft.max_participant,
            require_approval: eventDraft.require_approval,
            category: eventDraft.category,
            kind: eventDraft.kind,
            tags: eventDraft.tags || [],
            requirement_tags: eventDraft.requirement_tags || []
        },
        authToken,
        clientMode
    })
}

export type CancelRecurringEventProps = Omit<UpdateRecurringEventProps, 'eventDraft' | 'endTimeDiff' | 'startTimeDiff'>

export const cancelRecurringEvent = async ({
    params: {recurringId, afterEventId, authToken},
    clientMode
}: SolaSdkFunctionParams<CancelRecurringEventProps>) => {
    await request(`/recurring/${recurringId}/cancel`, {
        method: 'POST',
        body: {
            selector: afterEventId ? 'after' : 'all',
            event_id: afterEventId
        },
        authToken,
        clientMode
    })
}

// --- stars / approval ---

export const starEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    await request('/comments/star', {
        method: 'POST',
        body: {item_type: 'Event', item_id: eventId},
        authToken,
        clientMode
    })
}

export const unstarEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    await request('/comments/unstar', {
        method: 'POST',
        body: {item_type: 'Event', item_id: eventId},
        authToken,
        clientMode
    })
}

/** Group manager publishes a pending event. */
export const approveEvent = async ({params: {eventId, authToken}, clientMode}: SolaSdkFunctionParams<{
    eventId: string,
    authToken: string
}>) => {
    await request(`/events/${eventId}/approve`, {method: 'POST', authToken, clientMode})
}

/** The events the current user is attending (is_attending flag over their groups). */
export const getProfileAttendedEvents = async ({params: {authToken}, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    const me = await request<{ id: string, name: string }>('/users/me', {authToken, clientMode, noCache: true})
    const res = await request<Paginated<EventWithJoinStatus>>('/events', {
        params: {attendee_id: me.id, limit: 100},
        authToken,
        clientMode,
        noCache: true
    })
    return res.data
}
