import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getAvailableGroupsForEventHost, Group} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export interface CreatePopupCityPageDataSearchParams {
    grouphandle: string
}

export default async function CreatePopupCityPageData(grouphandle?: string) {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/')
    }

    const groups = await getAvailableGroupsForEventHost(({
        params: {profileHandle: currProfile.handle},
        clientMode: CLIENT_MODE
    }))

    let presetGroup:Group | undefined = undefined

    if (grouphandle) {
        presetGroup = groups.find(g => {
            return g.handle === grouphandle
        })

        if (!presetGroup) {
            redirect('/')
        }
    }

    console.log('presetGroup =>', grouphandle, presetGroup, groups.map(g => g.handle))

    return {
        availableGroups: groups,
        presetGroup
    }
}