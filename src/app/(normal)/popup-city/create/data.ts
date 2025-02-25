import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getAvailableGroupsForEventHost} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export default async function CreatePopupCityPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/')
    }

    const groups = await getAvailableGroupsForEventHost(({
        params: {profileHandle: currProfile.handle},
        clientMode: CLIENT_MODE
    }))

    return {
        availableGroups: groups,
    }
}