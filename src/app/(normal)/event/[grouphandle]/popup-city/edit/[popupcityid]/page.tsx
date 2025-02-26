import EditPopupCityPageData, {
    EditPopupCityPageProps
} from '@/app/(normal)/event/[grouphandle]/popup-city/edit/[popupcityid]/data'
import PopupCityForm from './PopupCityForm'
import {selectLang} from '@/app/actions'

export default async function EditPopupCityPage({params}: EditPopupCityPageProps) {
    const {popupCity, currProfile} = await EditPopupCityPageData(params.popupcityid)
    const {lang} = await selectLang()

    return <PopupCityForm popupCity={popupCity} lang={lang}/>
}