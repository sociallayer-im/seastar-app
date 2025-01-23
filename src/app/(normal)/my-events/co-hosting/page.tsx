import MyEventsPageData from '@/app/(normal)/my-events/data'
import MyEvents from '@/app/(normal)/my-events/MyEvents'

export default async function MyEventsPage() {
    const {coHosting} = await MyEventsPageData()
    return <MyEvents events={coHosting} tab="co-hosting"/>
}
