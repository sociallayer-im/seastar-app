import {AsyncProps} from '@/utils'
import GroupPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {selectLang} from "@/app/actions"
import TransferOwnerForm from "./TransferOwnerForm"
import {cache} from 'react'

export const fetchCache = 'force-no-store'

const cachedGroupPageData = cache(GroupPageData)

export async function generateMetadata(props: AsyncProps<GroupDataProps>) {
    const params = await props.params

    const {
        handle
    } = params

    const {group} = await cachedGroupPageData(handle)
    return {
        title: `Transfer Owner | ${group.nickname || group.name}`
    }
}

export default async function TransferOwnerPage(props: AsyncProps<GroupDataProps>) {
    const params = await props.params

    const {
        handle
    } = params

    const {group, members} = await cachedGroupPageData(handle)
    const lang = (await selectLang()).lang

    return <TransferOwnerForm lang={lang} group={group} members={members}/>
}