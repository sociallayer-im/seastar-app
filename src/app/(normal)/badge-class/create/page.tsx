import {selectLang} from "@/app/actions"
import CreateBadgeForm from "@/app/(normal)/badge-class/create/CreateBadgeForm"
import CreateBadgePageData, {CreateBadgePageDataProps} from '@/app/(normal)/badge-class/create/data'

export default async function CreateBadgePage(props: CreateBadgePageDataProps) {
    const {lang} = await selectLang()
    const data = await CreateBadgePageData(props)
    return <CreateBadgeForm lang={lang} {...data}/>
}