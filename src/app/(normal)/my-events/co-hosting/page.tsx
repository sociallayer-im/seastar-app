import MyEvents from '@/app/(normal)/my-events/MyEvents'
import MyEventsCohostingPageData from '@/app/(normal)/my-events/co-hosting/data'

export default async function MyEventsPage() {
    const {coHosting} = await MyEventsCohostingPageData()
    return <MyEvents events={coHosting} tab="co-hosting"/>
}
