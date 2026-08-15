/** One scope, with the human-readable text the consent screen renders. */
export interface OauthScopeDetail {
    scope: string
    en: string
    zh: string
    /**
     * Purchase history (tickets:read). Registration is not reviewed, so the
     * consent screen has to call this out rather than listing it like the rest.
     */
    sensitive: boolean
}

/** What GET /oauth/authorize returns for the consent screen. */
export interface OauthAuthorizeInfo {
    client_id: string
    app_name: string
    app_description: string | null
    app_logo_url: string | null
    app_homepage_url: string | null
    /** The person or group behind the app — shown so the user can judge it. */
    owner_handle: string | null
    owner_type: 'user' | 'group'
    /** Whether a platform admin has vetted it. Informational; grants nothing. */
    reviewed: boolean
    trusted: boolean
    redirect_uri: string
    /** Host of redirect_uri, so the screen can show where the data is going. */
    redirect_host: string | null
    scopes: string[]
    scope_details: OauthScopeDetail[]
    has_sensitive_scope: boolean
    previously_granted: string[]
    can_skip_consent: boolean
}

/** POST /oauth/authorize — the frontend performs the navigation, not the API. */
export interface OauthAuthorizeDecisionResult {
    redirect_uri: string
    code?: string
    state?: string | null
    error?: string
}

export interface OauthApplication {
    id: string
    client_id: string
    name: string
    description: string | null
    logo_url: string | null
    homepage_url: string | null
    redirect_uris: string[]
    allowed_scopes: string[]
    status: 'draft' | 'active' | 'disabled'
    confidential: boolean
    owner_handle: string | null
    owner_type: 'user' | 'group'
    reviewed: boolean
    created_at: string
}

/**
 * Only ever present on the create and rotate_secret responses. There is no
 * endpoint that can show it again.
 */
export interface OauthApplicationWithSecret extends OauthApplication {
    client_secret: string | null
}

export interface OauthApplicationAdmin extends OauthApplication {
    trusted: boolean
    owner_id: string
    group_id: string | null
    reviewed_at: string | null
    updated_at: string
    active_token_count: number
    grant_count: number
}

export interface OauthGrant {
    id: string
    client_id: string
    app_name: string
    app_logo_url: string | null
    owner_handle: string | null
    scopes: string[]
    scope_details: OauthScopeDetail[]
    created_at: string
    updated_at: string
}

export interface OauthApplicationDraft {
    name: string
    description?: string
    logo_url?: string
    homepage_url?: string
    redirect_uris: string[]
    allowed_scopes: string[]
    status?: 'draft' | 'active' | 'disabled'
    /** Creation only — a client cannot change sides later. */
    confidential?: boolean
}
