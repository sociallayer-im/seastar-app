import GroupEditPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {selectLang} from "@/app/actions"
import TransferOwnerForm from "./TransferOwnerForm"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupDataProps) {
    const {group} = await GroupEditPageData(props)
    return {
        title: `Transfer Owner | ${group.nickname || group.handle}`
    }
}

export default async function TransferOwnerPage(props: GroupDataProps) {
    const {group, members} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    return <TransferOwnerForm lang={lang} group={group} members={members}/>
}