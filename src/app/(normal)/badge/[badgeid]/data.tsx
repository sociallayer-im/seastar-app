import {redirect} from "next/navigation"
import {getBadgeDetailByBadgeId} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface BadgePageParams {
    badgeid: string
}

export interface BadgePageDataProps {
    params: BadgePageParams
}

export default async function BadgePageData({params}: BadgePageDataProps) {
    const badgeDetail = await getBadgeDetailByBadgeId({
        params: {badgeId: parseInt(params.badgeid)},
        clientMode: CLIENT_MODE
    })
    const currProfile = await getCurrProfile()

    if (!badgeDetail) {
        redirect('/404')
    }

    return {
        isPrivate: badgeDetail.badge_class.badge_type === 'private',
        isOwner: currProfile?.id === badgeDetail.owner.id,
        groupCreator: badgeDetail.badge_class.group,
        badge: badgeDetail,
        badgeClass: badgeDetail.badge_class
    }
}