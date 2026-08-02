import {getFedEvents} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'

export default async function FediversePageData() {
    const authToken = await getServerSideAuth()
    const [events, currProfile] = await Promise.all([
        getFedEvents({params: {authToken}, clientMode: CLIENT_MODE}).catch(() => []),
        getCurrProfile()
    ])
    return {events, currProfile, authToken}
}
