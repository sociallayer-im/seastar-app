import {redirect} from "next/navigation"
import {
    getBadgeClassDetailByBadgeClassId,
    getProfileDetailByName,
    getGroupDetailById,
    request,
    Paginated,
    Profile,
    Badge
} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
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
        params: {badgeClassId: badgeclassid},
        clientMode: CLIENT_MODE
    })
    const currProfile = await getCurrProfile()

    const toProfileName = to

    if (!badgeClassDetail) {
        redirect('/404')
    }

    let toProfile: Profile | null = null
    if (!!toProfileName) {
        toProfile = await getProfileDetailByName({
            params: {name: toProfileName},
            clientMode: CLIENT_MODE
        })
    }

    // Minted badges of this class (BadgeClassBlueprint no longer embeds badges).
    const badges = (await request<Paginated<Badge>>('/badges', {
        params: {badge_class_id: badgeClassDetail.id, limit: 100},
        clientMode: CLIENT_MODE
    })).data

    // The badge class may be issued under a group — show the group as creator.
    const groupCreator = badgeClassDetail.group_id
        ? await getGroupDetailById({params: {groupId: badgeClassDetail.group_id}, clientMode: CLIENT_MODE})
        : undefined

    return {
        isPrivate: badgeClassDetail.badge_type === 'private',
        isOwner: currProfile?.id === badgeClassDetail.creator.id,
        badgeClass: badgeClassDetail,
        badges,
        toProfile: toProfile || undefined,
        groupCreator: groupCreator || undefined
    }
}
