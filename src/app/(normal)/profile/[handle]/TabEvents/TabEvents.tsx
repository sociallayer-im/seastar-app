import Tabs from './Tabs'
import {ProfileEventListData} from "@/app/(normal)/profile/[handle]/TabEvents/data"
import {Profile} from '@sola/sdk'

export default async function TabEvents({handle, currProfile}: { handle: string, currProfile?: Profile | null}) {
    const {attends, hosting, stared} = await ProfileEventListData(handle, currProfile)

    return <Tabs attends={attends} hosting={hosting} stared={stared}/>
}
