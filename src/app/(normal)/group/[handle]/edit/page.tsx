import GroupEditPageData, {GroupEditDataProps} from "@/app/(normal)/group/[handle]/edit/data"
import EditGroup from './EditGroup'
import {selectLang} from "@/app/actions"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupEditDataProps) {
    const {group} = await GroupEditPageData(props)
    return {
        title: `${group.nickname || group.handle} | Edit Group | Social Layer`
    }
}

export default async function EditGroupPage(props: GroupEditDataProps) {
    const {group, isGroupManager, members} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    return <EditGroup
        members={members}
        lang={lang}
        isManager={isGroupManager}
        group={group}/>


}
