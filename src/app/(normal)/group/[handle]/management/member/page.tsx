import GroupPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {selectLang} from "@/app/actions"
import MemberManagementForm from "@/app/(normal)/group/[handle]/management/member/MemberManagementForm"
import {cache} from 'react'

export const fetchCache = 'force-no-store'

const cachedGroupPageData = cache(GroupPageData)

export async function generateMetadata({params:{handle}}: GroupDataProps) {
    const {group} = await cachedGroupPageData(handle)
    return {
        title: `Member Management | ${group.nickname || group.handle}`
    }
}

export default async function MemberManagementPage({params:{handle}}: GroupDataProps) {
    const {group, members} = await cachedGroupPageData(handle)
    const lang = (await selectLang()).lang

    return <MemberManagementForm
        lang={lang}
        group={group}
        members={members}/>
}