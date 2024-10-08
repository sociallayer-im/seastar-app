declare namespace Solar {
    interface Profile {
        id?:number
        handle: string | null,
        address: string | null,
        email: string | null,
        phone: string | null,
        zupass: string | null,
        status: 'active' | 'freezed'
        image_url: string | null,
        nickname: string | null,
        about: string | null,
        location: string | null,
        sol_address: string | null,
        farcaster_fid: string | null,
        farcaster_address: string | null,
        extras: string,
        permissions: string
    }
}
