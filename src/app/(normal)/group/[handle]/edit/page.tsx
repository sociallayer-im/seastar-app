import EditGroup from './EditGroup'
import {selectLang} from "@/app/actions"
import GroupPageData, {GroupDataProps} from '@/app/(normal)/group/[handle]/data'

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupDataProps) {
    const {group} = await GroupPageData(props)
    return {
        title: `${group.nickname || group.handle} | Edit Group | Social Layer`
    }
}

export default async function EditGroupPage(props: GroupDataProps) {
    const {group, currUserIsManager, members} = await GroupPageData(props)
    const lang = (await selectLang()).lang

    return <EditGroup
        members={members}
        lang={lang}
        isManager={currUserIsManager}
        group={group}/>


}
