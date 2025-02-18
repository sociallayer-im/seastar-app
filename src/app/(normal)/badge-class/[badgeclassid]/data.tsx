import {redirect} from "next/navigation"
import {getBadgeClassDetailByBadgeClassId, getProfileDetailByHandle, Profile} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
import {pickSearchParam} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

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

export default async function BadgeClassPageData(badgeclassid: string, to?: string) {
    const badgeClassDetail = await getBadgeClassDetailByBadgeClassId({
        params: {badgeClassId: parseInt(badgeclassid)},
        clientMode: CLIENT_MODE
    })
    const currProfile = await getCurrProfile()

    const toProfileHandle = to

    if (!badgeClassDetail) {
        redirect('/404')
    }

    let toProfile: Profile | null = null
    if (!!toProfileHandle) {
        toProfile = await getProfileDetailByHandle({
            params: {handle: toProfileHandle},
            clientMode:CLIENT_MODE
        })
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


