import {awaitProps, AsyncProps} from '@/utils'
import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import TagForm from '@/app/(normal)/event/[grouphandle]/tags/TagForm'

export default async function GroupTracksPage(props: AsyncProps<GroupEventSettingDataProps>) {
    const {groupDetail} = await GroupEventSettingData(await awaitProps(props))
    const {lang} = await selectLang()

    return <TagForm lang={lang} groupDetail={groupDetail} />
}