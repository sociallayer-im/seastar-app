import MyEvents from '@/app/(normal)/my-events/MyEvents'
import MyEventsPendingRequestPageData from '@/app/(normal)/my-events/pending-requests/data'

export default async function MyEventsPage() {
    const {pendingRequests} = await MyEventsPendingRequestPageData()
    return <MyEvents events={pendingRequests} tab="pending"/>
}
