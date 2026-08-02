import {getFedEvents, getFedFollowing} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'

export default async function FediversePageData() {
    const authToken = await getServerSideAuth()
    const [events, currProfile, following] = await Promise.all([
        getFedEvents({params: {authToken}, clientMode: CLIENT_MODE}).catch(() => []),
        getCurrProfile(),
        // only meaningful when signed in, and a failure here must not take the page down
        authToken
            ? getFedFollowing({params: {authToken}, clientMode: CLIENT_MODE}).catch(() => [])
            : Promise.resolve([])
    ])
    return {events, currProfile, following, authToken}
}
