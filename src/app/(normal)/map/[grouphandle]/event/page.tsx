import {awaitProps, AsyncProps} from '@/utils'
import EventMap from "@/app/(normal)/map/[grouphandle]/event/Map"
import GroupEventMapData, {GroupEventMapDataProps} from '@/app/(normal)/map/[grouphandle]/event/data'
import {selectLang} from '@/app/actions'

export default async function MapPage(props: AsyncProps<GroupEventMapDataProps>) {
    const {events, targetEventId, groupDetail} = await GroupEventMapData(await awaitProps(props))
    const {lang, type} = await selectLang()

    return <EventMap
        langType={type}
        events={events}
        lang={lang}
        groupDetail={groupDetail}
        targetEventId={targetEventId}/>
}
