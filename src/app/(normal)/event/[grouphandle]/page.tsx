import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'
import {GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {selectLang} from '@/app/actions'
import {displayProfileName} from '@/utils'


export async function generateMetadata(props: GroupEventHomeDataProps) {
    const {params: {grouphandle}} = props
    const {lang} = await selectLang()
    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: grouphandle!},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    return {
        title: lang['Events of [{1}]'].replace('{1}', displayProfileName(groupDetail)),
        openGraph: {
            title: lang['Events of [{1}]'].replace('{1}', displayProfileName(groupDetail)),
            images: groupDetail.banner_image_url || 'https://app.sola.day/images/facaster_default_cover.png',
        }
    }
}

export default async function EventHome(props: GroupEventHomeDataProps) {
    return <GroupEventHome {...props} />
}
