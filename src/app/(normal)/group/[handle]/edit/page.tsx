import EditGroup from './EditGroup'
import {selectLang} from "@/app/actions"
import GroupPageData, {GroupDataProps} from '@/app/(normal)/group/[handle]/data'

export const fetchCache = 'force-no-store'

export async function generateMetadata({params:{handle}}: GroupDataProps) {
    const {group} = await GroupPageData(handle)
    return {
        title: `${group.nickname || group.handle} | Edit Group | Social Layer`
    }
}

export default async function EditGroupPage({params: {handle}}: GroupDataProps) {
    const {group, currUserIsManager, members, currUserIsOwner} = await GroupPageData(handle)
    const lang = (await selectLang()).lang

    return <EditGroup
        members={members}
        lang={lang}
        isOwner={currUserIsOwner}
        isManager={currUserIsManager}
        group={group}/>


}
