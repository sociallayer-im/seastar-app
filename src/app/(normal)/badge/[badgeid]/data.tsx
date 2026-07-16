import {redirect} from "next/navigation"
import {getBadgeDetailByBadgeId, getGroupDetailById} from '@sola/sdk'
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
        params: {badgeId: params.badgeid},
        clientMode: CLIENT_MODE
    })
    const currProfile = await getCurrProfile()

    if (!badgeDetail) {
        redirect('/404')
    }

    // The badge class may be issued under a group — show the group as creator.
    const groupCreator = badgeDetail.badge_class.group_id
        ? await getGroupDetailById({params: {groupId: badgeDetail.badge_class.group_id}, clientMode: CLIENT_MODE})
        : undefined

    return {
        isPrivate: badgeDetail.badge_class.badge_type === 'private',
        isOwner: currProfile?.id === badgeDetail.owner.id,
        groupCreator: groupCreator || undefined,
        badge: badgeDetail,
        badgeClass: badgeDetail.badge_class
    }
}