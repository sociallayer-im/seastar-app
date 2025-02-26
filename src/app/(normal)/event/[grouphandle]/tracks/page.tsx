import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import TrackList from '@/app/(normal)/event/[grouphandle]/tracks/TrackList'

export default async function GroupTracksPage(props: GroupEventSettingDataProps) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(props)

    return <TrackList lang={lang} groupDetail={groupDetail}/>
}