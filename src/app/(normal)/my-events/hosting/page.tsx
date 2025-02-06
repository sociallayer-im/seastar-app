import MyEvents from '@/app/(normal)/my-events/MyEvents'
import MyEventsHostingPageData from '@/app/(normal)/my-events/hosting/data'

export default async function MyEventsPage() {
    const {hosting} = await MyEventsHostingPageData()
    return <MyEvents events={hosting} tab="hosting"/>
}
