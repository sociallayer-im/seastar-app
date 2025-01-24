import DiscoverPage from "@/app/(normal)/discover/page"
import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'
import { headers } from "next/headers"
import {GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'


export default async function Home(props: GroupEventHomeDataProps) {
    const headersList = headers()
    const eventHomeGroupHandle = headersList.get('x-event-home')
    return !!eventHomeGroupHandle
        ? <GroupEventHome  groupHandle={eventHomeGroupHandle} {...props}/>
        : <DiscoverPage />
}
