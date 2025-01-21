import Tabs from './Tabs'
import {selectLang} from "@/app/actions"
import {ProfileBadgeListData} from "@/app/(normal)/profile/[handle]/TabBadges/data"

export default async function TabBadges({handle, isSelf}: { handle: string, isSelf: boolean,  labels?: {created?: string, collected?: string}}) {
    const lang = (await selectLang()).lang
    const {created, owned} = await ProfileBadgeListData(handle)
    
    return  <Tabs handle={handle}
        isSelf={isSelf}
        created={created}
        owned={owned}
        labels={{created: lang['Created'], collected: lang['Collected']}} />
}
