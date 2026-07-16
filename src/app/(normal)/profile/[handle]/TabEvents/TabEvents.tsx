import Tabs from './Tabs'
import {ProfileEventListData} from "@/app/(normal)/profile/[handle]/TabEvents/data"
import {Profile} from '@sola/sdk'
import {selectLang} from '@/app/actions'

export default async function TabEvents({name, currProfile}: { name: string, currProfile?: Profile | null}) {
    const {attends, hosting, stared, coHosting} = await ProfileEventListData(name, currProfile)
    const {lang} = await selectLang()

    return <Tabs attends={attends} hosting={hosting} stared={stared} lang={lang} coHosting={coHosting}/>
}
