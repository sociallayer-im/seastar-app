import {request, Paginated} from '../request'
import {SolaSdkFunctionParams} from '../types'
import type {
    OauthApplication,
    OauthApplicationAdmin,
    OauthApplicationDraft,
    OauthApplicationWithSecret,
    OauthAuthorizeDecisionResult,
    OauthAuthorizeInfo,
    OauthGrant
} from './types'

/**
 * The query string a client sent to /oauth/authorize, passed straight through
 * to the API. The consent page never interprets these — the backend is the one
 * place that decides what a valid authorization request is.
 */
export interface OauthAuthorizeQuery {
    client_id: string
    redirect_uri: string
    response_type: string
    scope: string
    code_challenge: string
    code_challenge_method: string
    state?: string
    nonce?: string
}

/**
 * Everything the consent screen renders. Send authToken when the user is
 * signed in — the response then reports what they have already granted, which
 * is what lets a repeat visit skip the screen.
 */
export const getOauthAuthorizeInfo = async ({params, clientMode}: SolaSdkFunctionParams<{
    query: OauthAuthorizeQuery, authToken?: string
}>) => {
    return await request<OauthAuthorizeInfo>('/oauth/authorize', {
        clientMode,
        params: params.query as unknown as Record<string, unknown>,
        authToken: params.authToken,
        noCache: true
    })
}

/**
 * The user accepts or denies. Returns the code (or the error) for the browser
 * to append to redirect_uri — this SDK does not navigate.
 */
export const decideOauthAuthorization = async ({params, clientMode}: SolaSdkFunctionParams<{
    query: OauthAuthorizeQuery, decision: 'allow' | 'deny', authToken: string
}>) => {
    return await request<OauthAuthorizeDecisionResult>('/oauth/authorize', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {...params.query, decision: params.decision}
    })
}

/**
 * Builds the URL to send the browser back to. state is echoed so the client
 * can match the response to the request it started.
 */
export const buildOauthRedirect = (result: OauthAuthorizeDecisionResult) => {
    const url = new URL(result.redirect_uri)
    if (result.code) url.searchParams.set('code', result.code)
    if (result.error) url.searchParams.set('error', result.error)
    if (result.state) url.searchParams.set('state', result.state)
    return url.toString()
}

// --- developer portal ------------------------------------------------------

export const getMyOauthApplications = async ({params, clientMode}: SolaSdkFunctionParams<{authToken: string}>) => {
    return await request<OauthApplication[]>('/oauth/applications', {
        clientMode, authToken: params.authToken, noCache: true
    })
}

export const getOauthApplication = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, authToken: string
}>) => {
    return await request<OauthApplication>(`/oauth/applications/${params.id}`, {
        clientMode, authToken: params.authToken, noCache: true
    })
}

/**
 * The returned client_secret is readable exactly here and in rotateOauthSecret.
 * Show it once; there is no endpoint that can return it again.
 */
export const createOauthApplication = async ({params, clientMode}: SolaSdkFunctionParams<{
    application: OauthApplicationDraft, groupId?: string, authToken: string
}>) => {
    return await request<OauthApplicationWithSecret>('/oauth/applications', {
        clientMode,
        method: 'POST',
        authToken: params.authToken,
        body: {application: params.application, group_id: params.groupId}
    })
}

export const updateOauthApplication = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, application: Partial<OauthApplicationDraft>, authToken: string
}>) => {
    return await request<OauthApplication>(`/oauth/applications/${params.id}`, {
        clientMode,
        method: 'PATCH',
        authToken: params.authToken,
        body: {application: params.application}
    })
}

export const removeOauthApplication = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, authToken: string
}>) => {
    return await request<{result: string}>(`/oauth/applications/${params.id}`, {
        clientMode, method: 'DELETE', authToken: params.authToken
    })
}

export const rotateOauthSecret = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, authToken: string
}>) => {
    return await request<OauthApplicationWithSecret>(`/oauth/applications/${params.id}/rotate_secret`, {
        clientMode, method: 'POST', authToken: params.authToken
    })
}

// --- the user's own consents ----------------------------------------------

export const getMyOauthGrants = async ({params, clientMode}: SolaSdkFunctionParams<{authToken: string}>) => {
    return await request<OauthGrant[]>('/oauth/grants', {
        clientMode, authToken: params.authToken, noCache: true
    })
}

/** Also revokes the tokens the consent produced — see OauthGrant#revoke!. */
export const revokeOauthGrant = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, authToken: string
}>) => {
    return await request<{result: string}>(`/oauth/grants/${params.id}`, {
        clientMode, method: 'DELETE', authToken: params.authToken
    })
}

// --- platform admin --------------------------------------------------------

export const getAllOauthApplications = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string, page?: number, limit?: number, status?: string, q?: string
}>) => {
    return await request<Paginated<OauthApplicationAdmin>>('/oauth/admin/applications', {
        clientMode,
        authToken: params.authToken,
        params: {page: params.page, limit: params.limit, status: params.status, q: params.q},
        noCache: true
    })
}

export const setOauthApplicationReviewed = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, reviewed: boolean, authToken: string
}>) => {
    return await request<OauthApplicationAdmin>(`/oauth/admin/applications/${params.id}/review`, {
        clientMode, method: 'POST', authToken: params.authToken, body: {reviewed: params.reviewed}
    })
}

/** Stops the app AND burns every live token it holds. */
export const disableOauthApplication = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, authToken: string
}>) => {
    return await request<OauthApplicationAdmin>(`/oauth/admin/applications/${params.id}/disable`, {
        clientMode, method: 'POST', authToken: params.authToken
    })
}
