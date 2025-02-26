import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import GroupBannerForm from '@/app/(normal)/event/[grouphandle]/banner/BannerForm'

export default async function GroupBannerPage(props: GroupEventSettingDataProps) {
    const {groupDetail} = await GroupEventSettingData(props)
    const {lang} = await selectLang()

    return <GroupBannerForm groupDetail={groupDetail} lang={lang}/>
}