import {getSdkConfig, ClientMode} from './client'

/**
 * Error thrown for any non-2xx response. soon returns {error: string} bodies
 * with real HTTP status codes (401/403/404/422/...), unlike the old sails
 * 200-with-{result:'error'} convention.
 */
export class SolaApiError extends Error {
    status: number
    /**
     * Machine-readable discriminator, when the endpoint sends one alongside
     * `error`. Only a few do — it is for failures the caller can act on rather
     * than only display (e.g. OPENID_REQUIRED, which is recoverable by sending
     * the buyer through a silent WeChat authorize).
     */
    code?: string
    /**
     * RFC 6749 §5.2 `error_description`. The OAuth endpoints answer with
     * {error, error_description} where `error` is a machine code — so for
     * those, `message` is the code and this is the sentence.
     */
    description?: string

    constructor(message: string, status: number, code?: string, description?: string) {
        super(message)
        this.name = 'SolaApiError'
        this.status = status
        this.code = code
        this.description = description
    }
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    /** Query-string params; null/undefined values are skipped, arrays become k[]= */
    params?: Record<string, unknown>
    /** JSON request body */
    body?: unknown
    /** JWT — sent as Authorization: Bearer <token> */
    authToken?: string
    clientMode?: ClientMode
    /** Pass for auth-gated or user-specific GETs (Next.js caches fetch by default) */
    noCache?: boolean
}

/**
 * The one transport for every soon API call. Paths are relative to /api/v1
 * (e.g. request('/events', {...})).
 */
export async function request<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
    const base = getSdkConfig(opts.clientMode).api
    const url = new URL(`${base}/api/v1${path}`)
    Object.entries(opts.params || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        if (Array.isArray(value)) {
            value.forEach(item => url.searchParams.append(`${key}[]`, String(item)))
        } else {
            url.searchParams.set(key, String(value))
        }
    })

    const headers: Record<string, string> = {}
    if (opts.authToken) headers['Authorization'] = `Bearer ${opts.authToken}`

    let body: string | undefined
    if (opts.body !== undefined) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(opts.body)
    }

    const resp = await fetch(url.toString(), {
        method: opts.method || 'GET',
        headers,
        body,
        ...(opts.noCache ? {cache: 'no-store' as const} : {})
    })

    if (resp.status === 204) return undefined as T

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
        throw new SolaApiError(
            (data as any).error || `Request failed (${resp.status})`,
            resp.status,
            (data as any).code,
            (data as any).error_description
        )
    }
    return data as T
}

/** GET that returns null on 404 instead of throwing — for detail lookups. */
export async function requestOrNull<T = any>(path: string, opts: RequestOptions = {}): Promise<T | null> {
    try {
        return await request<T>(path, opts)
    } catch (e) {
        if (e instanceof SolaApiError && e.status === 404) return null
        throw e
    }
}

/** soon's paginated envelope ({data, meta}) from render_collection. */
export interface Paginated<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        total_pages: number
        next_page: number | null
        prev_page: number | null
    }
}

/** Fetch every page of a paginated endpoint (bounded — for modest lists). */
export async function requestAllPages<T = any>(path: string, opts: RequestOptions = {}, maxPages = 20): Promise<T[]> {
    const items: T[] = []
    let page = 1
    for (; ;) {
        const res = await request<Paginated<T>>(path, {
            ...opts,
            params: {...opts.params, page, limit: 100}
        })
        items.push(...res.data)
        if (!res.meta.next_page || page >= maxPages) break
        page = res.meta.next_page
    }
    return items
}
