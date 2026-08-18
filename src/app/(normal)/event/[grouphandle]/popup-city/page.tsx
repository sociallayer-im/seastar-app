import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import {selectLang} from '@/app/actions'
import PopupCityForm from './PopupCityForm'

// Group and popup city are the same table now (no separate PopupCity
// entity) — this edits the current group's own start_date/end_date/
// location/featured_image_url directly via updateGroup, rather than the old
// list-of-entities-you-manage + "create a new one" flow from when popup
// cities lived in a separate table.
export default async function GroupPopupCityPage(props: GroupEventSettingDataProps) {
    const {groupDetail} = await GroupEventSettingData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    const {lang} = await selectLang()

    return <PopupCityForm groupDetail={groupDetail} lang={lang}/>
}
