import { calculateGridPosition } from "./data"
import { redirect } from 'next/navigation'
import { getServerSideAuth, selectLang } from "@/app/actions"
import { cache } from 'react'
import { getGroupDetailByName } from '@sola/sdk'
import { CLIENT_MODE } from '@/app/config'
import { headers } from "next/headers"
import ScheduleVenueView from "./ScheduleVenueView"
import { IframeSchedulePageParams, IframeSchedulePageSearchParams } from "../../utils"

const cachedGetGroupDetailByHandle = cache((handle: string) => {
    return getGroupDetailByName({ params: { groupName: handle }, clientMode: CLIENT_MODE })
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

export default async function IframeScheduleVenuePage(
    props: { params: Promise<{ grouphandle: string }>, searchParams: Promise<{ start_date: string }> }
) {
    const searchParams = await props.searchParams
    const params = await props.params
    const groupDetail = await cachedGetGroupDetailByHandle(params.grouphandle)
    if (!groupDetail) { redirect('/404') }

    const lang = (await selectLang()).lang
    const currPath = (await headers()).get('x-current-path')
    const authToken = await getServerSideAuth()

    const { events, data } = await calculateGridPosition({
        groupDetail,
        searchParams,
        currPath: currPath || '',
        authToken
    })

    return <ScheduleVenueView
        data={data}
        groupDetail={groupDetail}
        events={events}
        lang={lang}
        authToken={authToken} />
}