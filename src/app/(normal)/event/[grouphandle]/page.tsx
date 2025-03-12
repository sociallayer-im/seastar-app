import GroupEventHomeNew from '@/app/(normal)/event/[grouphandle]/GroupEventHomeNew'
import {
    GroupEventHomeParams,
    GroupEventHomeSearchParams
} from '@/app/(normal)/event/[grouphandle]/data'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {selectLang} from '@/app/actions'
import {displayProfileName} from '@/utils'
import {cache} from 'react'

const cachedGetGroupDetailByHandle = cache(async (handle: string) => {
    return await getGroupDetailByHandle({
        params: {groupHandle: handle!},
        clientMode: CLIENT_MODE
    })
})


export async function generateMetadata(props: {params: GroupEventHomeParams}) {
    const {params: {grouphandle}} = props
    const {lang} = await selectLang()
    const groupDetail = await cachedGetGroupDetailByHandle(grouphandle!)

    if (!groupDetail) {
        redirect('/404')
    }

    return {
        title: lang['Events of [{1}]'].replace('{1}', displayProfileName(groupDetail)),
        openGraph: {
            title: lang['Events of [{1}]'].replace('{1}', displayProfileName(groupDetail)),
            images: groupDetail.banner_image_url || '/images/facaster_default_cover.png',
        }
    }
}

export default async function EventHome(props: {params: GroupEventHomeParams, searchParams: GroupEventHomeSearchParams}) {
    const {params: {grouphandle}} = props
    const groupDetail = await cachedGetGroupDetailByHandle(grouphandle!)

    if (!groupDetail) {
        redirect('/404')
    }

    return <GroupEventHomeNew searchParams={props.searchParams} groupDetail={groupDetail} />
}
