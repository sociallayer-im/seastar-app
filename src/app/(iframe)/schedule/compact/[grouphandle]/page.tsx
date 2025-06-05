import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import {
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/utils"
import {getServerSideAuth, selectLang} from "@/app/actions"
import {cache} from 'react'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import ScheduleCompactView from "./ScheduleCompactView"
import { getAuth } from "@/utils"
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
            title: `${groupDetail.nickname || groupDetail.handle} Event Schedule | ${process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer"}`
        }
    }
}

export default async function IframeScheduleWeeklyPage({searchParams, params}: {
    params: IframeSchedulePageParams,
    searchParams: IframeSchedulePageSearchParams
}) {
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {redirect('/404')}

    const lang = (await selectLang()).lang
    const currPath = headers().get('x-current-path')
    const authToken = await getServerSideAuth()
    
    const {events, data} = await calculateGridPosition({
        groupDetail,
        searchParams,
        currPath: currPath || '',
        authToken
    })

    return <ScheduleCompactView
        data={data}
        groupDetail={groupDetail}
        events={events}
        lang={lang}
        authToken={authToken}
    />
}
