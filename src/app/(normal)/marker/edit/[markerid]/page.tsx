import {MarkerDetailPageDataProps} from '@/app/(normal)/marker/detail/[markerid]/data'
import {selectLang} from '@/app/actions'
import MarkerEditData from '@/app/(normal)/marker/edit/[markerid]/data'
import EditMarkerForm from '@/app/(normal)/marker/edit/[markerid]/EditMarkerForm'

export default async function MarkerEditPage(props: MarkerDetailPageDataProps) {
    const {lang} = await selectLang()
    const {markerDetail, currProfile, group} = await MarkerEditData(props)

    return <div className="page-width-md !pt-0 !pb-12">
        <div className="pt-6 pb-10 font-semibold text-center text-xl relative">
            {lang['Edit Marker']}
        </div>
        <EditMarkerForm lang={lang} draft={markerDetail} group={group}/>
    </div>
}