import GroupBadgeData from "@/app/(normal)/group/[handle]/TabBadges/data"
import Tabs from "@/app/(normal)/group/[handle]/TabBadges/Tabs"
import {selectLang} from "@/app/actions"

interface TabBadgesProps {
    handle: string
    isManager: boolean
    isIssuer: boolean
    isMember: boolean
}

export default async function TabBadges ({handle, isManager, isIssuer, isMember}: TabBadgesProps) {
    const {created, invites} = await GroupBadgeData(handle)
    const {lang} = await selectLang()

    return <Tabs
        groupHandle={handle}
        isManager={isManager}
        isIssuer={isIssuer}
        isMember={isMember}
        created={created}
        inviting={invites}
        lang={lang} />
}
