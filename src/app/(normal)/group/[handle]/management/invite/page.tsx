import {selectLang} from "@/app/actions"
import IssueBadgeForm from "./InviteForm"
import GroupPageData, {GroupDataProps} from '@/app/(normal)/group/[handle]/data'

export default async function IssueBadgePage(props: GroupDataProps) {
    const {group} = await GroupPageData(props)
    const {lang} = await selectLang()

    return <IssueBadgeForm
        lang={lang}
        group={group}
    />
}