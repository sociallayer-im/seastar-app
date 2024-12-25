import EventForm from "@/app/(normal)/event/[grouphandle]/create/EventForm"
import {cookies} from "next/headers"
import {selectLang} from "@/app/actions"
import EditEventPageData, {EditEventPageDataProps} from "@/app/(normal)/event/edit/[eventid]/data"

export default async function EventEditPage({ params } : {params: EditEventPageDataProps}) {
    const pageData = await EditEventPageData({ params, cookies: cookies() })
    const { lang } = await selectLang()
    return <EventForm
        data={pageData}
        lang={lang}
        event={pageData.eventDetail}
    />
}
