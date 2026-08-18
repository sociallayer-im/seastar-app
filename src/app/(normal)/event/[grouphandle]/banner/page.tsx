import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import GroupBannerForm from '@/app/(normal)/event/[grouphandle]/banner/BannerForm'

export default async function GroupBannerPage(props: GroupEventSettingDataProps) {
    const {groupDetail} = await GroupEventSettingData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    const {lang} = await selectLang()

    return <GroupBannerForm groupDetail={groupDetail} lang={lang}/>
}