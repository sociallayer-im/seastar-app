import {calculateGridPosition} from "./data"
import {redirect} from 'next/navigation'
import {
    IframeSchedulePageData,
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/utils"
import {getServerSideAuth, selectLang} from "@/app/actions"
import {cache} from 'react'
import {getGroupDetailByName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import ScheduleWeekView from "./ScheduleWeekView"
import { headers } from "next/headers"

const cachedGetGroupDetailByHandle = cache((handle: string) => {
    return getGroupDetailByName({params: {groupName: handle}, clientMode: CLIENT_MODE})
})

export async function generateMetadata(
    props: {params: Promise<IframeSchedulePageParams>, searchParams: Promise<IframeSchedulePageSearchParams>}
) {
    const params = await props.params
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {
        redirect('/404')
    } else {
        return {
            title: `${groupDetail.nickname || groupDetail.name} Event Schedule | ${process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer"}`
        }
    }
}

export default async function IframeScheduleWeeklyPage(
    props: {
        params: Promise<IframeSchedulePageParams>,
        searchParams: Promise<IframeSchedulePageSearchParams>
    }
) {
    const params = await props.params
    const searchParams = await props.searchParams
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) {redirect('/404')}

    const currPath = (await headers()).get('x-current-path')
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
