import {awaitProps, AsyncProps} from '@/utils'
import {MarkerDetailPageDataProps} from '@/app/(normal)/marker/detail/[markerid]/data'
import {selectLang} from '@/app/actions'
import MarkerEditData from '@/app/(normal)/marker/edit/[markerid]/data'
import EditMarkerForm from '@/app/(normal)/marker/edit/[markerid]/EditMarkerForm'

export default async function MarkerEditPage(props: AsyncProps<MarkerDetailPageDataProps>) {
    const {lang} = await selectLang()
    const {markerDetail, group} = await MarkerEditData(await awaitProps(props))
    if (!group) {
        throw new Error('Marker has no group')
    }
    // Marker (read shape) -> MarkerDraft (write shape): flatten the place back
    // into the draft's location fields.
    const draft = {
        id: markerDetail.id,
        group_id: group.id,
        category: markerDetail.category,
        pin_image_url: markerDetail.pin_image_url,
        cover_image_url: markerDetail.cover_image_url,
        title: markerDetail.title,
        about: markerDetail.about,
        link: markerDetail.link,
        status: markerDetail.status,
        data: markerDetail.data,
        location: markerDetail.place?.name || null,
        formatted_address: markerDetail.place?.address || null,
        geo_lat: markerDetail.place?.latitude ?? null,
        geo_lng: markerDetail.place?.longitude ?? null,
    }

    return <div className="page-width-md !pt-0 !pb-12">
        <div className="pt-6 pb-10 font-semibold text-center text-xl relative">
            {lang['Edit Marker']}
        </div>
        <EditMarkerForm lang={lang} draft={draft} group={group}/>
    </div>
}