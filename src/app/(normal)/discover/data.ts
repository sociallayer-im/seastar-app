import {discoverData} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export default async function DiscoverPageData() {
    const data = await discoverData({clientMode: CLIENT_MODE})
    const currProfile = await getCurrProfile()
    return {
        ...data,
        currProfile
    }
}