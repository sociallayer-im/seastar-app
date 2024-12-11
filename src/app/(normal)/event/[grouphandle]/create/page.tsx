import CreateEventPageData, { CreateEventPageDataProps, emptyEvent } from "@/app/(normal)/event/[grouphandle]/create/data"
import { cookies } from 'next/headers'
import EventForm from "@/app/(normal)/event/[grouphandle]/create/EventForm"
import { selectLang } from "@/app/actions"

export default async function CreateEvent({ params }: { params: CreateEventPageDataProps }) {
    const pageData = await CreateEventPageData({ params, cookies: cookies() })
    const { lang } = await selectLang()


    return <EventForm
        data={pageData}
        lang={lang}
        event={emptyEvent}
    />
}
