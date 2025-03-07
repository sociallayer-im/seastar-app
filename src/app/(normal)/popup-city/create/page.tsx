import CreatePopupCityPageData, {CreatePopupCityPageDataSearchParams} from '@/app/(normal)/popup-city/create/data'
import CreatePopupCityForm from '@/app/(normal)/popup-city/create/CreatePopupCityForm'
import {selectLang} from '@/app/actions'
import {pickSearchParam} from '@/utils'

export default async function CreatePopupCityPage({searchParams}:{searchParams: CreatePopupCityPageDataSearchParams}) {
    const presetGroupHandle = pickSearchParam(searchParams.grouphandle)
    const {availableGroups, presetGroup} = await CreatePopupCityPageData(presetGroupHandle)
    const {lang} = await selectLang()

    console.log('presetGroup', presetGroup)

    return <CreatePopupCityForm
        presetGroup={presetGroup}
        availableGroups={availableGroups}
        lang={lang}/>
}