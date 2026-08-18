import {ListViewData} from "./data"
import {redirect} from 'next/navigation'
import {
    IframeSchedulePageParams,
    IframeSchedulePageSearchParams
} from "@/app/(iframe)/schedule/utils"
import {getServerSideAuth, selectLang} from "@/app/actions"
import {cache} from 'react'
import {getGroupDetailByName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import ScheduleListView from "./ScheduleListView"
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


    const lang = (await selectLang()).lang
    const currPath = (await headers()).get('x-current-path')
    const authToken = await getServerSideAuth()

    const {groupedEventByStartDate, data} = await ListViewData({
        groupDetail,
        searchParams,
        currPath: currPath!,
        authToken
    })

    return <ScheduleListView 
        groupDetail={groupDetail}
        groupedEventByStartDate={groupedEventByStartDate}
        data={data}
        lang={lang}
        authToken={authToken}/>
}
