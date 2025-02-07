import GroupBadgeData from "@/app/(normal)/group/[handle]/TabBadges/data"
import Tabs from "@/app/(normal)/group/[handle]/TabBadges/Tabs"
import {getCurrProfile, selectLang} from "@/app/actions"
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

interface TabBadgesProps {
    handle: string
    isManager: boolean
    isIssuer: boolean
    isMember: boolean
}

export default async function TabBadges({handle, isManager, isIssuer, isMember}: TabBadgesProps) {
    const {badgeClasses, groupInvites} = await GroupBadgeData(handle)
    const {lang} = await selectLang()
    const currProfile = await getCurrProfile() || undefined
    const groupsDetail = await getGroupDetailByHandle({
        params: {groupHandle: handle},
        clientMode: CLIENT_MODE
    })


    return <Tabs
        group={groupsDetail!}
        isManager={isManager}
        isIssuer={isIssuer}
        isMember={isMember}
        created={badgeClasses}
        inviting={groupInvites}
        currProfile={currProfile}
        lang={lang}/>
}
