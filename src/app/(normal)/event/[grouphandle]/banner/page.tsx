import {awaitProps, AsyncProps} from '@/utils'
import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import GroupBannerForm from '@/app/(normal)/event/[grouphandle]/banner/BannerForm'

export default async function GroupBannerPage(props: AsyncProps<GroupEventSettingDataProps>) {
    const {groupDetail} = await GroupEventSettingData(await awaitProps(props))
    const {lang} = await selectLang()

    return <GroupBannerForm groupDetail={groupDetail} lang={lang}/>
}