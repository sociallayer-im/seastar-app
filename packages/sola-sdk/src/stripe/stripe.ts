import {SolaSdkFunctionParams} from '../types'
import {request} from '../request'

/**
 * Stripe integration (backend: soon design/PAYMENTS_PLAN.md).
 * All endpoints exist only on deployments with STRIPE_ENABLED (SG) — on CN
 * they 404, so callers should gate on NEXT_PUBLIC_STRIPE_ENABLED first.
 */

/** StripeSettingBlueprint — never carries the secret key, only masked_key. */
export interface StripeSetting {
    id: string
    name: string
    mode: 'live' | 'test'
    status: 'active' | 'invalid'
    currency: string
    account_id: string | null
    masked_key: string
    /** Webhook provisioning failed → confirmations come from the sweeper only. */
    delayed_confirmation: boolean
    created_at: string
}

/** The caller's own Stripe keys, for the settings page and ticket-form pickers. */
export const getStripeSettings = async ({params, clientMode}: SolaSdkFunctionParams<{ authToken: string }>) => {
    return await request<StripeSetting[]>('/stripe_settings', {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

export const createStripeSetting = async ({params, clientMode}: SolaSdkFunctionParams<{
    name: string,
    secretKey: string,
    currency?: string,
    authToken: string
}>) => {
    return await request<StripeSetting>('/stripe_settings', {
        method: 'POST',
        body: {stripe_setting: {name: params.name, secret_key: params.secretKey, currency: params.currency}},
        authToken: params.authToken,
        clientMode
    })
}

export const updateStripeSetting = async ({params, clientMode}: SolaSdkFunctionParams<{
    settingId: string,
    name?: string,
    secretKey?: string,
    currency?: string,
    authToken: string
}>) => {
    return await request<StripeSetting>(`/stripe_settings/${params.settingId}`, {
        method: 'PATCH',
        body: {stripe_setting: {name: params.name, secret_key: params.secretKey, currency: params.currency}},
        authToken: params.authToken,
        clientMode
    })
}

/** Fails with an error when the key still has pending / recently paid orders. */
export const removeStripeSetting = async ({params, clientMode}: SolaSdkFunctionParams<{
    settingId: string,
    authToken: string
}>) => {
    await request(`/stripe_settings/${params.settingId}`, {
        method: 'DELETE',
        authToken: params.authToken,
        clientMode
    })
}

/**
 * Mints (or re-serves — one open session per order) the Stripe-hosted
 * Checkout page for a pending stripe ticket_item. Redirect the browser to
 * checkout_url; never mark anything paid client-side, the return page polls
 * until the webhook confirms.
 */
export const createStripeCheckoutSession = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId: string,
    authToken: string
}>) => {
    return await request<{ result: string, checkout_url: string, session_id: string }>(
        '/tickets/checkout_session', {
            method: 'POST',
            body: {ticket_item_id: params.ticketItemId},
            authToken: params.authToken,
            clientMode
        })
}

/**
 * Organizer-initiated refund (event owner / co-host; group owner for group
 * tickets). Omitting amount = full refund. Returns while the refund is still
 * pending — Stripe's webhook finalizes it asynchronously.
 */
export const refundTicketItem = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId: string,
    amount?: number,
    reason?: string,
    authToken: string
}>) => {
    return await request<{ result: string, refund_id: string, status: string }>(
        `/tickets/${params.ticketItemId}/refund`, {
            method: 'POST',
            body: {amount: params.amount, reason: params.reason},
            authToken: params.authToken,
            clientMode
        })
}
