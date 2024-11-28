export interface Media_Meta_Type {
    label: string
    icon: string,
    valueType: 'url' | 'username',
    eg: string
}

export const Media_Meta: { [index in keyof Solar.SocialMedia]: Media_Meta_Type } = {
    website: {
        label: 'Website',
        icon: 'media-web',
        valueType: 'url',
        eg: 'eg. https://xxxx.com'
    },
    x: {
        label: 'X',
        icon: 'media-x',
        valueType: 'url',
        eg: 'eg. "https://x.com/xxx" \nor username "xxx" without "@"'
    },
    github: {
        label: 'Github',
        icon: 'media-github',
        valueType: 'url',
        eg: 'eg. https://github.com/xxxx \nor username "xxxx" without "@"'
    },
    discord: {
        label: 'Discord',
        icon: 'media-discord',
        valueType: 'username',
        eg: 'eg. sociallayer, username "xxxx" without "@"'
    },
    ens: {
        label: 'ENS',
        icon: 'media-ens',
        valueType: 'url',
        eg: 'eg. https://app.ens.domains/xxxx \nor xxxx.eth'
    },
    lens: {
        label: 'Lens',
        icon: 'media-lens',
        valueType: 'url',
        eg: 'eg. https://hay.xyz/u/xxxx \nor username "xxxx" without "@"'
    },
    nostr: {
        label: 'Nostr',
        icon: 'media-web',
        valueType: 'username',
        eg: 'eg. username "xxxx" without "@"'
    },
    farcaster: {
        label: 'Farcaster',
        icon: 'media-farcaster',
        valueType: 'url',
        eg: 'eg. https://farcaster.app/xxxx \nor username "xxxx" without "@"'
    },
    telegram: {
        label: 'Telegram',
        icon: 'media-telegram',
        valueType: 'url',
        eg: 'eg. https://t.me/xxxx \nor username "xxxx" without "@"'
    },
}

export const getMeta = (key: keyof Solar.SocialMedia) => {
    return Media_Meta[key]
}

export const urlToUsername = (url: string, type: keyof Solar.SocialMedia) => {
    if (type === 'x') {
        const match = url.match(/https:\/\/x\.com\/([^\/]+)/)
        if (match && match[1]) {
            return match[1]
        }
        return url
    }

    if (type === 'github') {
        const match = url.match(/https:\/\/github\.com\/([^\/]+)/)
        if (match && match[1]) {
            return match[1]
        }
        return url
    }

    if (type === 'discord') {
        return url
    }

    if (type === 'ens') {
        const match = url.match(/https:\/\/app\.ens\.domains\/([^\/]+)/)
        if (match && match[1]) {
            return match[1]
        }
        return url
    }

    if (type === 'lens') {
        // https://hey.xyz/u/augustuscaesar
        const match = url.match(/https:\/\/hay\.xyz\/u\/([^\/]+)/)
        if (match && match[1]) {
            return match[1]
        }
        return url
    }

    if (type === 'nostr') {
        return url
    }

    if (type === 'website') {
        return url
    }

    if (type === 'farcaster') {
        const match = url.match(/https:\/\/farcaster\.app\/([^\/]+)/)
        if (match && match[1]) {
            return match[1]
        }
        return url
    }

    if (type === 'telegram') {
        const match = url.match(/https:\/\/t\.me\/([^\/]+)/)
        if (match && match[1]) {
            return match[1]
        }
        return url
    }

    return url
}

export const usernameToUrl = (username: string, type: keyof Solar.SocialMedia) => {
    switch (type) {
    case "x":
        return `https://x.com/${username}`
    case "github":
        return `https://github.com/${username}`
    case "discord":
        return username
    case "ens":
        return `https://app.ens.domains/${username}`
    case "lens":
        return `https://hay.xyz/u/${username}`
    case "nostr":
        return username
    case "website":
        return username
    case "farcaster":
        return `https://farcaster.app/${username}`
    case "telegram":
        return `https://t.me/${username}`
    default:
        return username
    }
}
