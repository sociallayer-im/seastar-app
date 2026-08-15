import {SolaSdkFunctionParams} from '../types'
import {request, requestAllPages, Paginated} from '../request'
import {EventForm, EventFormField, FormFieldType, FormSubmission} from '../event/types'

/**
 * Forms that stand on their own — a survey, a call for proposals, a sign-up
 * sheet with no event behind it.
 *
 * The event-attached form is a different set of endpoints (`saveEventForm` and
 * friends in event/event.ts, keyed by event id). It is the same Form model
 * underneath: `events.form_id` points AT a form, so a form has never actually
 * needed an event. These functions are how you use one without one.
 */

/** FormBlueprint :with_counts — a row in "forms I created". */
export interface FormListItem extends Omit<EventForm, 'fields'> {
    slug: string,
    submission_count: number,
    field_count: number,
    /** Set when an event uses this form as its registration questions. Such a
     *  form is edited from the event page, not the standalone editor — the two
     *  would otherwise fight over the same fields. */
    event_id: string | null,
}

/** FormSubmissionBlueprint :with_form — a row in "forms I filled in". The
 *  answers are the point; the form is what makes them readable. */
export interface FormSubmissionWithForm extends FormSubmission {
    form: EventForm,
}

export interface FormFieldDraft {
    id?: string,
    label: string,
    field_type: FormFieldType,
    required: boolean,
    for_admin?: boolean,
    position: number,
    options?: string[],
}

/** The forms I created, event-attached ones included (they carry event_id). */
export const listMyForms = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    return await requestAllPages<FormListItem>('/forms', {
        authToken: params.authToken, clientMode, noCache: true
    })
}

/** The forms I filled in — one row per submission, newest first. */
export const listMyFormSubmissions = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    return await requestAllPages<FormSubmissionWithForm>('/forms/submissions', {
        authToken: params.authToken, clientMode, noCache: true
    })
}

export const createForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    title: string,
    description?: string | null,
    submissionMessage?: string | null,
    published?: boolean,
    fields: FormFieldDraft[],
    authToken: string
}>) => {
    return await request<EventForm>('/forms', {
        method: 'POST',
        body: {
            title: params.title,
            description: params.description,
            submission_message: params.submissionMessage,
            published: params.published,
            fields: params.fields
        },
        authToken: params.authToken,
        clientMode
    })
}

export const updateForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    slug: string,
    title?: string,
    description?: string | null,
    submissionMessage?: string | null,
    published?: boolean,
    fields?: FormFieldDraft[],
    authToken: string
}>) => {
    // Only the keys actually supplied are sent: the API treats a present
    // `fields` as authoritative and deletes anything missing from it, so
    // sending `fields: undefined` as `null` would wipe the questions.
    const body: Record<string, unknown> = {}
    if (params.title !== undefined) body.title = params.title
    if (params.description !== undefined) body.description = params.description
    if (params.submissionMessage !== undefined) body.submission_message = params.submissionMessage
    if (params.published !== undefined) body.published = params.published
    if (params.fields !== undefined) body.fields = params.fields

    return await request<EventForm>(`/forms/${params.slug}`, {
        method: 'PATCH',
        body,
        authToken: params.authToken,
        clientMode
    })
}

export const deleteForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    slug: string,
    authToken: string
}>) => {
    await request(`/forms/${params.slug}`, {
        method: 'DELETE', authToken: params.authToken, clientMode
    })
}

/** Public for a published form — no token needed to read what is being asked. */
export const getForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    slug: string,
    authToken?: string
}>) => {
    try {
        return await request<EventForm>(`/forms/${params.slug}`, {
            authToken: params.authToken, clientMode, noCache: true
        })
    } catch {
        return null
    }
}

/** Fill it in, or change what I filled in — the API upserts on (form, user). */
export const submitForm = async ({params, clientMode}: SolaSdkFunctionParams<{
    slug: string,
    answers: Array<{field_id: string, value: string}>,
    authToken: string
}>) => {
    return await request<FormSubmission>(`/forms/${params.slug}/submissions`, {
        method: 'POST',
        body: {answers: params.answers},
        authToken: params.authToken,
        clientMode
    })
}

/** My own answers, for prefilling the form when I come back to change them. */
export const getMyFormSubmission = async ({params, clientMode}: SolaSdkFunctionParams<{
    slug: string,
    authToken: string
}>) => {
    const data = await request<FormSubmission | {submission: null}>(
        `/forms/${params.slug}/my_submission`,
        {authToken: params.authToken, clientMode, noCache: true}
    )
    if (!data || (data as {submission: null}).submission === null) return null
    return data as FormSubmission
}

/**
 * Everything people answered. Author only — the API 403s for anyone else.
 *
 * Returns `total` alongside the rows because a form shared as a public link
 * has no upper bound on responses: past `maxPages` this stops fetching, and a
 * page that showed 2000 of 5000 rows without saying so would read as "that is
 * all of them".
 */
export const listFormResponses = async ({params, clientMode}: SolaSdkFunctionParams<{
    slug: string,
    authToken: string,
    maxPages?: number
}>) => {
    const maxPages = params.maxPages ?? 20
    const responses: FormSubmission[] = []
    let total = 0
    let page = 1
    for (; ;) {
        const res = await request<Paginated<FormSubmission>>(`/forms/${params.slug}/submissions`, {
            params: {page, limit: 100},
            authToken: params.authToken,
            clientMode,
            noCache: true
        })
        responses.push(...res.data)
        total = res.meta.total
        if (!res.meta.next_page || page >= maxPages) break
        page = res.meta.next_page
    }
    return {responses, total}
}

export type {EventForm, EventFormField, FormSubmission}
