import {getGroupDetailByHandle, getMarkersByGroupHandle, getMarkersByGroupHandleAndCategory} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {pickSearchParam} from '@/utils'
import {MARKER_TYPES} from '@/app/(normal)/map/[grouphandle]/marker/marker_type'

export type GroupMarkerMapParams = {
    grouphandle: string
}

export type GroupMarkerMapSearchParams = {
    category: string | string[]
}

export interface GroupMarkerMapPageDataProps {
    params: GroupMarkerMapParams
    searchParams: GroupMarkerMapSearchParams
}

export default async function GroupMarkerMapPageData({params, searchParams}: GroupMarkerMapPageDataProps) {
    const groupHandle = params.grouphandle
    const groupDetail = await getGroupDetailByHandle(groupHandle)

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    const category = MARKER_TYPES.find(type => type.label === pickSearchParam(searchParams.category)) || null

    console.log('category', category)

    const markers = category
        ? await getMarkersByGroupHandleAndCategory(groupHandle, category.label)
        : await getMarkersByGroupHandle(groupHandle)

    return {
        groupDetail,
        currProfile,
        markers,
        category
    }
}
