import GroupEditPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {selectLang} from "@/app/actions"
import MemberManagementForm from "@/app/(normal)/group/[handle]/management/member/MemberManagementForm"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupDataProps) {
    const {group} = await GroupEditPageData(props)
    return {
        title: `Member Management | ${group.nickname || group.handle}`
    }
}

export default async function MemberManagementPage(props: GroupDataProps) {
    const {group, members} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    return <MemberManagementForm
        lang={lang}
        group={group}
        members={members}/>
}