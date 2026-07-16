import Tabs from './Tabs'
import {selectLang} from "@/app/actions"
import {ProfileBadgeListData} from "@/app/(normal)/profile/[handle]/TabBadges/data"

export default async function TabBadges({name, isSelf}: { name: string, isSelf: boolean,  labels?: {created?: string, collected?: string}}) {
    const lang = (await selectLang()).lang
    const {created, owned} = await ProfileBadgeListData(name)
    
    return  <Tabs handle={name}
        isSelf={isSelf}
        created={created}
        owned={owned}
        labels={{created: lang['Created'], collected: lang['Collected']}} />
}
