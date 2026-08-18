import {awaitProps, AsyncProps} from '@/utils'
import {selectLang} from "@/app/actions"
import CreateBadgeForm from "@/app/(normal)/badge-class/create/CreateBadgeForm"
import CreateBadgePageData, {CreateBadgePageDataProps} from '@/app/(normal)/badge-class/create/data'

export default async function CreateBadgePage(props: AsyncProps<CreateBadgePageDataProps>) {
    const {lang} = await selectLang()
    const data = await CreateBadgePageData(await awaitProps(props))
    return <CreateBadgeForm lang={lang} {...data}/>
}