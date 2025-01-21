import {redirect} from "next/navigation"
import {getBadgeClassDetailByBadgeClassId} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'

export interface BadgeClassPageParams {
    badgeclassid: string
}

export interface BadgeClassPageDataProps {
    params: BadgeClassPageParams
}

export default async function BadgeClassPageData({params}: BadgeClassPageDataProps) {
    const badgeClassDetail = await getBadgeClassDetailByBadgeClassId(parseInt(params.badgeclassid))
    const currProfile = await getCurrProfile()

    if (!badgeClassDetail) {
        redirect('/404')
    }

    return {
        isPrivate: badgeClassDetail.badge_type === 'private',
        isOwner: currProfile?.id === badgeClassDetail.creator_id,
        badgeClass: badgeClassDetail,
        badges: badgeClassDetail.badges
    }
}


