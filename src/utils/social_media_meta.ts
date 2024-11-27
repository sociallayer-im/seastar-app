export interface Media_Meta_Type {
    label: string
    icon: string
}

export const Media_Meta: {[index in keyof Solar.SocialMedia]: Media_Meta_Type} = {
    twitter: {label: 'X', icon: 'media-x'},
    github: {label: 'Github', icon: 'media-github'},
    discord: {label: 'Discord', icon: 'media-discord'},
    ens: {label: 'ENS', icon: 'media-ens'},
    lens: {label: 'Lens', icon: 'media-lens'},
    nostr: {label: 'Nostr', icon: 'media-web'},
    website: {label: 'Website', icon: 'media-web'},
    farcaster: {label: 'Farcaster', icon: 'media-farcaster'},
    telegram: {label: 'Telegram', icon: 'media-telegram'},
}

export const getMeta = (key: keyof Solar.SocialMedia) => {
    return Media_Meta[key]
}
