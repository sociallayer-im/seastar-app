import MyEvents from '@/app/(normal)/my-events/MyEvents'
import MyEventsAttendedPageData from '@/app/(normal)/my-events/attended/data'


export default async function MyEventsPage() {
    const {attends, remoteEvents} = await MyEventsAttendedPageData()
    return <MyEvents events={attends} tab="attended" remoteEvents={remoteEvents}/>
}
