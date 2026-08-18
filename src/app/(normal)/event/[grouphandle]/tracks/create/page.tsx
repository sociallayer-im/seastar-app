import TrackCreateData, {TrackCreateDataProps} from '@/app/(normal)/event/[grouphandle]/tracks/create/data'
import {selectLang} from '@/app/actions'
import CreateTrackForm from '@/app/(normal)/event/[grouphandle]/tracks/create/CreateTrackForm'

export default async function CreatTrackPage(props: TrackCreateDataProps) {
    const {groupDetail, emptyTrack} = await TrackCreateData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    const {lang} = await selectLang()

    return <CreateTrackForm lang={lang} trackDetail={emptyTrack} groupDetail={groupDetail}/>
}