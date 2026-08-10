import {Group, Profile} from '@sola/sdk'
import {cfImage, getAvatar} from '@/utils'
import Img from '@/components/Img'

export type ProfileLike = Profile | Group

export type AvatarProps = {
    profile: ProfileLike
    size: number
    className?: string
    /** For an avatar that is the page's LCP element. Lists should leave this off. */
    priority?: boolean
}

// Lazy by default: avatars are overwhelmingly used in lists (member rosters,
// community grids, the 425-card directory), where eagerly fetching every one
// puts hundreds of requests in flight at once. Native lazy loading still
// fetches anything at or near the viewport straight away, so the avatar at the
// top of a profile page is not delayed by this.
export default function Avatar({profile, size, className, priority}: AvatarProps) {
    return <Img
        src={cfImage(getAvatar(profile.id, profile.image_url), { width: size * 2, height: size * 2, fit: 'cover' })}
        width={size}
        height={size}
        priority={priority}
        style={{width: `${size}px`, height: `${size}px`}}
        className={`rounded-full ${className}`}
        alt=""/>
}
