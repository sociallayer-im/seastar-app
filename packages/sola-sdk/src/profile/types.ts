/**
 * Someone on another server. Rendered wherever a payload can carry either a
 * local `user` or a federated identity — comments and participants both do.
 * `acct` (name@server) is what a reader needs: a remote display name on its
 * own is indistinguishable from a local one.
 */
export interface RemoteAuthor {
    acct: string
    domain: string
    name: string | null
    image_url: string | null
    url: string
}

export interface Profile {
    id: string
    name: string
    image_url: string | null
    nickname: string | null
    created_at?: string
    email?: string | null
}

/**
 * The public :profile view (plus email when viewing yourself via /users/me).
 */
export interface ProfileDetail extends Profile {
    bio: string | null
    eth: string | null
    social_links: SocialMedia | null
    email?: string | null
    /**
     * Canonical E.164 (+8613800138000), only on /users/me (:self view) — PII on
     * the same footing as email. Only ever set on CN, where SMS sign-in exists.
     */
    phone?: string | null
    /**
     * Whether this account signed in through WeChat. Only on the :self view,
     * and deliberately a boolean rather than the openid — binding a phone is
     * required for WeChat accounts and only those (see onboardingTarget).
     */
    wechat?: boolean
    /** Only on /users/me (:self view). "admin" marks a platform administrator. */
    permissions?: string[]
    /**
     * Platform administrator. Only on /users/me (:self view) — a public profile
     * never carries it, so this can only ever be read about yourself.
     *
     * Read-only: the flag is set directly in the database and is absent from
     * the API's permit list, so there is no request that changes it.
     * `permissions: ['admin']` is the older marker for the same thing and still
     * grants the same authorization server-side; both are worth checking when
     * gating UI.
     */
    admin?: boolean
}

export interface SocialMedia {
    twitter?: string | null
    github?: string | null
    discord?: string | null
    ens?: string | null
    lens?: string | null
    nostr?: string | null
    telegram?: string | null
}
