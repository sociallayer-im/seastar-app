import TrackCreateData, {TrackCreateDataProps} from '@/app/(normal)/event/[grouphandle]/tracks/create/data'
import {selectLang} from '@/app/actions'
import CreateTrackForm from '@/app/(normal)/event/[grouphandle]/tracks/create/CreateTrackForm'

export default async function CreatTrackPage(props: TrackCreateDataProps) {
    const {groupDetail, emptyTrack} = await TrackCreateData(props)
    const {lang} = await selectLang()

    return <CreateTrackForm lang={lang} trackDetail={emptyTrack} groupDetail={groupDetail}/>
}