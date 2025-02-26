import {selectLang} from "@/app/actions"
import TrackDetailData, {TrackDetailDataProps} from '@/app/(normal)/event/[grouphandle]/tracks/edit/[trackid]/data'
import EditTrackForm from '@/app/(normal)/event/[grouphandle]/tracks/edit/[trackid]/EditTrackForm'

export default async function EditTrackPage(props: TrackDetailDataProps) {
    const {lang} = await selectLang()
    const {trackDetail, groupDetail} = await TrackDetailData(props)

    return <EditTrackForm
        lang={lang}
        trackDetail={trackDetail}
        groupDetail={groupDetail!} />
}