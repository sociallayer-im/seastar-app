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
