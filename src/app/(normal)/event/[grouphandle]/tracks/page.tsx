import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import TrackList from '@/app/(normal)/event/[grouphandle]/tracks/TrackList'

export default async function GroupTracksPage(props: GroupEventSettingDataProps) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)

    return <TrackList lang={lang} groupDetail={groupDetail}/>
}