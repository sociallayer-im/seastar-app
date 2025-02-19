import DiscoverPage, {generateMetadata as discoverGenerateMetadata} from "@/app/(normal)/discover/page"
import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'
import { headers } from "next/headers"
import {GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'
import {generateMetadata as groupGenerateMetadata} from '@/app/(normal)/event/[grouphandle]/page'

export async function generateMetadata(props: GroupEventHomeDataProps) {
    const headersList = headers()
    const eventHomeGroupHandle = headersList.get('x-event-home')
    return !!eventHomeGroupHandle
        ? await groupGenerateMetadata(props)
        : await discoverGenerateMetadata()
}

export default async function Home(props: GroupEventHomeDataProps) {
    const headersList = headers()
    const eventHomeGroupHandle = headersList.get('x-event-home')
    return !!eventHomeGroupHandle
        ? <GroupEventHome  groupHandle={eventHomeGroupHandle} {...props}/>
        : <DiscoverPage />
}
