import {SolaSdkFunctionParams} from '../types'
import {request, Paginated} from '../request'

/**
 * WeChat Pay (backend: soon design/WECHAT_INTEGRATION.md §2).
 *
 * These endpoints exist only on deployments with WECHAT_PAY_ENABLED (CN) and
 * an installed merchant — on SG they 404, so callers should gate on
 * NEXT_PUBLIC_WECHAT_PAY_ENABLED first, exactly as with the Stripe module.
 */

/**
 * What WeixinJSBridge.invoke('getBrandWCPayRequest', …) expects, verbatim.
 * The key casing is WeChat's, not ours — renaming any of it breaks the call.
 *
 * paySign is computed server-side with the merchant private key. Nothing here
 * can be produced or altered in the browser, which is also why the bridge's
 * own success callback proves nothing and never marks an order paid.
 */
export interface WechatPayParams {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: 'RSA'
    paySign: string
}

/**
 * Places the JSAPI order for a pending WeChat ticket order.
 *
 * Throws with `code: 'OPENID_REQUIRED'` when the buyer's account carries no
 * WeChat openid — everyone who signed in by email rather than through WeChat.
 * That is recoverable, not fatal: send them through /api/wechat/bind-openid
 * (a silent snsapi_base authorize) and retry.
 */
export const createWechatPrepay = async ({params, clientMode}: SolaSdkFunctionParams<{
    ticketItemId: string,
    authToken: string
}>) => {
    return await request<{ result: string, pay_params: WechatPayParams }>(
        '/tickets/wechat_prepay', {
            method: 'POST',
            body: {ticket_item_id: params.ticketItemId},
            authToken: params.authToken,
            clientMode
        })
}

/** WithdrawalBlueprint. amount/currency are minor units, like TicketItem. */
export interface Withdrawal {
    id: string
    amount: number
    currency: string
    status: 'pending' | 'completed' | 'rejected'
    bank_name: string
    bank_account_number: string
    bank_account_name: string
    note: string | null
    processed_at: string | null
    created_at: string
}

/** One group the caller manages, with its pooled WeChat balance. */
export interface WithdrawalGroup {
    id: string
    name: string
    currency: string
    available_amount: number
    total_withdrawn: number
}

/**
 * WeChat is single-merchant mode (design/WECHAT_INTEGRATION.md §2.2): every
 * group's WeChat revenue sits in the platform's own merchant account, not
 * the organizer's, so it is settled out by hand rather than transferred
 * automatically. This module is that request queue, not a payout API.
 *
 * Balance is pooled per GROUP, not per user — a group can have more than one
 * manager, and any of them may request the group's withdrawal. Every call
 * below except `groups` takes the group whose pool is being read/drawn from.
 */

/** Every group the caller manages (owner/manager), each with its current balance — for the group picker. */
export const getWithdrawalGroups = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string
}>) => {
    const res = await request<{ groups: WithdrawalGroup[] }>('/withdrawals/groups', {
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
    return res.groups
}

/** Every withdrawal ever requested against this group's pool, by any of its managers. */
export const getGroupWithdrawals = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    authToken: string
}>) => {
    return await request<Withdrawal[]>('/withdrawals', {
        params: {group_id: params.groupId},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/** 96% of the group's net WeChat revenue (refunds already netted out), minus what's already requested/paid by any of its managers. */
export const getWithdrawalBalance = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    authToken: string
}>) => {
    return await request<{ currency: string, available_amount: number, total_withdrawn: number }>('/withdrawals/balance', {
        params: {group_id: params.groupId},
        authToken: params.authToken,
        clientMode,
        noCache: true
    })
}

/** Withdraws the group's entire available balance — there is no partial-amount input by design. */
export const createWithdrawal = async ({params, clientMode}: SolaSdkFunctionParams<{
    groupId: string,
    bankName: string,
    bankAccountNumber: string,
    bankAccountName: string,
    authToken: string
}>) => {
    return await request<Withdrawal>('/withdrawals', {
        method: 'POST',
        body: {
            group_id: params.groupId,
            bank_name: params.bankName,
            bank_account_number: params.bankAccountNumber,
            bank_account_name: params.bankAccountName
        },
        authToken: params.authToken,
        clientMode
    })
}

/**
 * Attaches a WeChat identity to the signed-in account.
 *
 * Server-side only: it needs NEXT_TOKEN, which must never reach the browser,
 * and the openid is only trustworthy because the caller has just redeemed the
 * authorization code with the app secret. Called from the
 * /api/wechat/bind-openid callback route handler.
 */
export const bindWechatIdentity = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string,
    wechatOpenid: string,
    wechatUnionid?: string,
    /** From WeChat's /sns/userinfo — used as the display name (nickname), never as the account's handle. */
    wechatNickname?: string,
    /** From WeChat's /sns/userinfo (headimgurl) — only ever fills a blank avatar server-side, never overwrites one. */
    wechatAvatarUrl?: string,
    nextToken: string
}>) => {
    return await request<{ id: string }>('/auth/bind_wechat', {
        method: 'POST',
        body: {
            wechat_openid: params.wechatOpenid,
            wechat_unionid: params.wechatUnionid,
            wechat_nickname: params.wechatNickname,
            wechat_avatar_url: params.wechatAvatarUrl,
            next_token: params.nextToken
        },
        authToken: params.authToken,
        clientMode
    })
}

/**
 * Platform-admin view over every withdrawal request, across every group —
 * WithdrawalBlueprint's :admin view. There is no transfer API behind
 * Withdrawal, so `update` below is the only way a request ever leaves
 * "pending": an operator pays the bank details by hand and records the
 * outcome through it.
 */
export interface WithdrawalAdmin extends Withdrawal {
    group_id: string
    group_name: string
    user_id: string
    requested_by: string
    processed_by_id: string | null
    processed_by_name: string | null
}

export const getAllWithdrawals = async ({params, clientMode}: SolaSdkFunctionParams<{
    authToken: string, page?: number, limit?: number, status?: string
}>) => {
    return await request<Paginated<WithdrawalAdmin>>('/admin/withdrawals', {
        clientMode,
        authToken: params.authToken,
        params: {page: params.page, limit: params.limit, status: params.status},
        noCache: true
    })
}

/** Settles (completed) or rejects a pending withdrawal. Only a pending one can be updated. */
export const updateWithdrawalStatus = async ({params, clientMode}: SolaSdkFunctionParams<{
    id: string, status: 'completed' | 'rejected', note?: string, authToken: string
}>) => {
    return await request<WithdrawalAdmin>(`/admin/withdrawals/${params.id}`, {
        method: 'PATCH',
        body: {status: params.status, note: params.note},
        authToken: params.authToken,
        clientMode
    })
}
