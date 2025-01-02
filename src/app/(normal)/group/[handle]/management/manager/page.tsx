import GroupEditPageData, {GroupEditDataProps} from "@/app/(normal)/group/[handle]/edit/data"
import {selectLang} from "@/app/actions"
import ManagerManagementForm from "./ManagerManagementForm"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupEditDataProps) {
    const {group} = await GroupEditPageData(props)
    return {
        title: `Manager Management | ${group.nickname || group.handle}`
    }
}

export default async function ManagerManagementPage(props: GroupEditDataProps) {
    const {group, members} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    return <ManagerManagementForm lang={lang} group={group} members={members}/>
}