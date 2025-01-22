import DiscoverPage from "@/app/(normal)/discover/page"
import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'
import { headers } from "next/headers"


export default async function Home() {
    const headersList = headers()
    const eventHomeGroupHandle = headersList.get('x-event-home')
    return !!eventHomeGroupHandle
        ? <GroupEventHome  groupHandle={eventHomeGroupHandle}/>
        : <DiscoverPage />
}
