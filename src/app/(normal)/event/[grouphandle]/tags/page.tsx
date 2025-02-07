import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import TagForm from '@/app/(normal)/event/[grouphandle]/tags/TagForm'

export default async function GroupTracksPage(props: GroupEventSettingDataProps) {
    const {groupDetail} = await GroupEventSettingData(props)
    const {lang} = await selectLang()

    return <TagForm lang={lang} groupDetail={groupDetail} />
}