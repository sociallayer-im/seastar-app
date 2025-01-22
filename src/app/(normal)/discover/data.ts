import {discoverData} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'

export default async function DiscoverPageData() {
    const data = await discoverData()
    const currProfile = await getCurrProfile()
    return {
        ...data,
        currProfile
    }
}