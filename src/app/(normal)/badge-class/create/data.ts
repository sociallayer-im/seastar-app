import {pickSearchParam} from '@/utils'
import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getAvailableBadgeClassCreatorGroups} from '@sola/sdk'

export type CreateBadgePageSearchParams = {
    badge_type?: string | string[]
    return?: string | string[]
    group?: string | string[]
    to?: string | string[]
}

export type CreateBadgePageDataProps = {
    searchParams: CreateBadgePageSearchParams
}

export default async function CreateBadgePageData({searchParams} : CreateBadgePageDataProps) {
    const badgeType = pickSearchParam(searchParams.badge_type) || 'badge'
    const returnPage = pickSearchParam(searchParams.return)
    const groupSenderId = pickSearchParam(searchParams.group)
    const receiverHandle = pickSearchParam(searchParams.to)

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect('/404')
    }

    const availableGroupCreator = await getAvailableBadgeClassCreatorGroups(currProfile.handle)

    // If groupSenderId is provided, check if the group is in the availableGroupCreator list
    if (!!groupSenderId && !availableGroupCreator.find(group => group.id === parseInt(groupSenderId))) {
        redirect('/404')
    }

    return {
        badgeType,
        returnPage,
        groupSenderId: groupSenderId ? parseInt(groupSenderId) : undefined,
        receiverHandle,
        currProfile,
        availableGroupCreator
    }
}