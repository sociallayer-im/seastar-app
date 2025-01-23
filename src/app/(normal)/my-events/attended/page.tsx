import MyEventsPageData from '@/app/(normal)/my-events/data'
import MyEvents from '@/app/(normal)/my-events/MyEvents'


export default async function MyEventsPage() {
    const {attends} = await MyEventsPageData()
    return <MyEvents events={attends} tab="attended" />
}
