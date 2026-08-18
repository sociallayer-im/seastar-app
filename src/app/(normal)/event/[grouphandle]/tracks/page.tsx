import {awaitProps, AsyncProps} from '@/utils'
import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import TrackList from '@/app/(normal)/event/[grouphandle]/tracks/TrackList'

export default async function GroupTracksPage(props: AsyncProps<GroupEventSettingDataProps>) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(await awaitProps(props))

    return <TrackList lang={lang} groupDetail={groupDetail}/>
}