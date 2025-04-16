import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/utils"
import {getServerSideAuth, selectLang} from "@/app/actions"
import {cache} from 'react'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import ScheduleWeekView from "./ScheduleWeekView"
import { headers } from "next/headers"

const cachedGetGroupDetailByHandle = cache((handle: string) => {
    return getGroupDetailByHandle({params: {groupHandle: handle}, clientMode: CLIENT_MODE})
})

export async function generateMetadata({params}: {params: IframeSchedulePageParams, searchParams: IframeSchedulePageSearchParams}) {
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {
        redirect('/404')
    } else {
        return {
            title: `${groupDetail.nickname || groupDetail.handle} Event Schedule | Social Layer`
        }
    }
}

export default async function IframeScheduleWeeklyPage({searchParams, params}: {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {redirect('/404')}

    const currPath = headers().get('x-current-path')
    const authToken = await getServerSideAuth()
    const lang = (await selectLang()).lang
    
    const {events, data} = await calculateGridPosition({
        groupDetail,
        searchParams,
        currPath: currPath || '',
        authToken
    })

    return <ScheduleWeekView
        groupDetail={groupDetail}
        data={data}
        disPlayEvents={events}
        lang={lang}
        authToken={authToken} />
}
