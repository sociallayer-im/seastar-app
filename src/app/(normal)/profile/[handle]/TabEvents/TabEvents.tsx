import Tabs from './Tabs'
import {ProfileEventListData} from "@/app/(normal)/profile/[handle]/TabEvents/data"

export default async function TabEvents({handle, currUserHandle}: { handle: string, currUserHandle?: string }) {
    const {attends, hosting, stared} = await ProfileEventListData(handle, currUserHandle)

    return <Tabs attends={attends} hosting={hosting} stared={stared}/>
}
