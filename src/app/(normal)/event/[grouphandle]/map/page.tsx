import {GroupEventListData} from "@/app/(normal)/group/[handle]/TabEvents/data"
import EventMap from "@/app/(normal)/event/[grouphandle]/map/Map"

export default async function MapPage() {
    const events = await GroupEventListData('woochiangmai')

    return <EventMap events={events}/>


}
