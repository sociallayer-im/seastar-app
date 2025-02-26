import MyEvents from '@/app/(normal)/my-events/MyEvents'
import MyEventsStaredPageData from '@/app/(normal)/my-events/stared/data'

export default async function MyEventsPage() {
    const {stared} = await MyEventsStaredPageData()
    return <MyEvents events={stared} tab="stared"/>
}
