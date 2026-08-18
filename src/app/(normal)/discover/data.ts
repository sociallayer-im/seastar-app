import {discoverData} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export default async function DiscoverPageData() {
    const [data, currProfile] = await Promise.all([
        discoverData({clientMode: CLIENT_MODE}),
        getCurrProfile()
    ])
    return {
        ...data,
        currProfile,
        enableGoogleMap: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_MAP === 'true'
    }
}