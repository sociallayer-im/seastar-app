import GroupPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {selectLang} from "@/app/actions"
import TransferOwnerForm from "./TransferOwnerForm"
import {cache} from 'react'

export const fetchCache = 'force-no-store'

const cachedGroupPageData = cache(GroupPageData)

export async function generateMetadata({params:{handle}}: GroupDataProps) {
    const {group} = await cachedGroupPageData(handle)
    return {
        title: `Transfer Owner | ${group.nickname || group.handle}`
    }
}

export default async function TransferOwnerPage({params:{handle}}: GroupDataProps) {
    const {group, members} = await cachedGroupPageData(handle)
    const lang = (await selectLang()).lang

    return <TransferOwnerForm lang={lang} group={group} members={members}/>
}