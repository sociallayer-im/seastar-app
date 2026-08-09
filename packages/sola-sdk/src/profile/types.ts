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
