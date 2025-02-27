import CreatePopupCityPageData from '@/app/(normal)/popup-city/create/data'
import CreatePopupCityForm from '@/app/(normal)/popup-city/create/CreatePopupCityForm'
import {selectLang} from '@/app/actions'

export default async function CreatePopupCityPage() {
    const {availableGroups} = await CreatePopupCityPageData()
    const {lang} = await selectLang()

    return <CreatePopupCityForm
        availableGroups={availableGroups}
        lang={lang}/>
}