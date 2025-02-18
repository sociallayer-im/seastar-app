import {pickSearchParam} from '@/utils'
import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getAvailableGroupsForBadgeClassCreator} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

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
    // const groupSenderId = pickSearchParam(searchParams.group)

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect('/')
    }

    const availableGroupCreator = await getAvailableGroupsForBadgeClassCreator({
        params: {profileHandle: currProfile.handle},
        clientMode: CLIENT_MODE
    })

    // If groupSenderId is provided, check if the group is in the availableGroupCreator list
    // console.log('groupSenderId', groupSenderId)
    // console.log('availableGroupCreator', availableGroupCreator)
    // if (!!groupSenderId && !availableGroupCreator.find(group => group.id === parseInt(groupSenderId))) {
    //     console.log('this one2')
    //     redirect('/404')
    // }

    return {
        badgeType,
        returnPage,
        groupSenderId: undefined,
        currProfile,
        availableGroupCreator
    }
}