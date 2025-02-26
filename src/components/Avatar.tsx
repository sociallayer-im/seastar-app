import {Group, Profile} from '@sola/sdk'
import {getAvatar} from '@/utils'
import Image from 'next/image'

export type ProfileLike = Profile | Group

export type AvatarProps = {
    profile: ProfileLike
    size: number
    className?: string
}
export default function Avatar({profile, size, className}: AvatarProps) {
    return <Image
        src={getAvatar(profile.id, profile.image_url)}
        width={size}
        height={size}
        style={{width: `${size}px`, height: `${size}px`}}
        className={`rounded-full ${className}`}
        alt=""/>
}