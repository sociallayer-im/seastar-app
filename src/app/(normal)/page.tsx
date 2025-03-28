import DiscoverPage, {generateMetadata as discoverGenerateMetadata} from "@/app/(normal)/discover/page"
import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'
import { headers } from "next/headers"
import GroupEventHomeData, { GroupEventHomeSearchParams} from '@/app/(normal)/event/[grouphandle]/data'
import {cache} from 'react'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {displayProfileName} from '@/utils'
import {selectLang} from '@/app/actions'

const cachedGetGroupDetailByHandle = cache(async (handle: string) => {
    return await getGroupDetailByHandle({
        params: {groupHandle: handle!},
        clientMode: CLIENT_MODE
    })
})


export async function generateMetadata() {
    const headersList = headers()
    const eventHomeGroupHandle = headersList.get('x-event-home')
    if (!!eventHomeGroupHandle) {
        const groupDetail = await cachedGetGroupDetailByHandle(eventHomeGroupHandle)
        if (!groupDetail) {
            redirect('/404')
        }

        const {lang} = await selectLang()
        return {
            title: lang['Events of [{1}]'].replace('{1}', displayProfileName(groupDetail)),
            openGraph: {
                title: lang['Events of [{1}]'].replace('{1}', displayProfileName(groupDetail)),
                images: groupDetail.banner_image_url || '/images/facaster_default_cover.png',
            }
        }
    } else {
        return await discoverGenerateMetadata()
    }
}

export default async function Home(props: {searchParams: GroupEventHomeSearchParams}) {
    const headersList = headers()
    const eventHomeGroupHandle = headersList.get('x-event-home')

    if (!!eventHomeGroupHandle) {
        const groupDetail = await cachedGetGroupDetailByHandle(eventHomeGroupHandle)
        if (!groupDetail) {
            redirect('/404')
        }

        const data = await GroupEventHomeData({searchParams: props.searchParams, groupDetail})
        const {lang, type} = await selectLang()
        return <GroupEventHome data={data} lang={lang} langType={type} />
    } else {
        return <DiscoverPage />
    }
}
