import Tabs from './Tabs'
import {ProfileEventListData} from "@/app/(normal)/profile/[handle]/TabEvents/data"
import {Profile} from '@sola/sdk'
import {selectLang} from '@/app/actions'

export default async function TabEvents({handle, currProfile}: { handle: string, currProfile?: Profile | null}) {
    const {attends, hosting, stared, coHosting} = await ProfileEventListData(handle, currProfile)
    const {lang} = await selectLang()

    return <Tabs attends={attends} hosting={hosting} stared={stared} lang={lang} coHosting={coHosting}/>
}
