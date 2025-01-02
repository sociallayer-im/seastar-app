import GroupEditPageData, {GroupEditDataProps} from "@/app/(normal)/group/[handle]/edit/data"
import {selectLang} from "@/app/actions"
import TransferOwnerForm from "./TransferOwnerForm"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupEditDataProps) {
    const {group} = await GroupEditPageData(props)
    return {
        title: `Transfer Owner | ${group.nickname || group.handle}`
    }
}

export default async function TransferOwnerPage(props: GroupEditDataProps) {
    const {group, members} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    return <TransferOwnerForm lang={lang} group={group} members={members}/>
}