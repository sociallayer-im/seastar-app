export interface Profile {
    id:number
    handle: string,
    image_url: string | null,
    nickname: string | null,
}

export interface ProfileDetail extends Profile {
    address: string | null,
    email: string | null,
    phone: string | null,
    status: 'active' | 'freezed'
    about: string | null,
    location: string | null,
    sol_address: string | null,
    farcaster_fid: string | null,
    farcaster_address: string | null,
    zupass: string | null,
    extras: string,
    permissions: string[],
    social_links: SocialMedia,
    follower_count: number,
    following_count: number,
}

export interface SocialMedia {
    twitter: string | null,
    facebook: string | null,
    instagram: string | null,
    linkedin: string | null,
    github: string | null,
    website: string | null,
}