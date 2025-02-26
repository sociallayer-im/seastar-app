export interface Profile {
    id:number
    handle: string,
    image_url: string | null,
    nickname: string | null,
    address?: string | null,
}

export interface ProfileDetail extends Profile {
    address: string | null,
    email: string | null,
    phone?: string | null,
    status: 'active' | 'freezed'
    about: string | null,
    location: string | null,
    sol_address: string | null,
    zupass: string | null,
    farcaster: string | null,
    permissions: string[],
    social_links: SocialMedia,
    follower_count: number,
    following_count: number,
}

export interface SocialMedia {
    twitter: string | null,
    github: string | null,
    discord: string | null,
    ens: string | null,
    lens: string | null,
    nostr: string | null,
    telegram: string | null,
}