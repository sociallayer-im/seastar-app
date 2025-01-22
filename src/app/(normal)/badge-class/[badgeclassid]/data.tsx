import {redirect} from "next/navigation"
import {getBadgeClassDetailByBadgeClassId, getProfileDetailByHandle, Profile} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
import {pickSearchParam} from '@/utils'

export interface BadgeClassPageParams {
    badgeclassid: string
}

export interface BadgeClassPageSearchParams {
    to?: string
}

export interface BadgeClassPageDataProps {
    params: BadgeClassPageParams
    searchParams: BadgeClassPageSearchParams
}

export default async function BadgeClassPageData({params, searchParams}: BadgeClassPageDataProps) {
    const badgeClassDetail = await getBadgeClassDetailByBadgeClassId(parseInt(params.badgeclassid))
    const currProfile = await getCurrProfile()

    const toProfileHandle = pickSearchParam(searchParams.to)

    if (!badgeClassDetail) {
        redirect('/404')
    }

    let toProfile: Profile | null = null
    if (!!toProfileHandle) {
        toProfile = await getProfileDetailByHandle(toProfileHandle)
    }

    return {
        isPrivate: badgeClassDetail.badge_type === 'private',
        isOwner: currProfile?.id === badgeClassDetail.creator_id,
        badgeClass: badgeClassDetail,
        badges: badgeClassDetail.badges,
        toProfile: toProfile || undefined,
        groupCreator: badgeClassDetail.group
    }
}


