import EventMap from "@/app/(normal)/map/[grouphandle]/event/Map"
import GroupEventMapData, {GroupEventMapDataProps} from '@/app/(normal)/map/[grouphandle]/event/data'
import {selectLang} from '@/app/actions'

export default async function MapPage(props: GroupEventMapDataProps) {
    const {events, targetEventId, groupDetail} = await GroupEventMapData(props)
    const {lang} = await selectLang()

    return <EventMap
        events={events}
        lang={lang}
        groupDetail={groupDetail}
        targetEventId={targetEventId}/>
}
