import CreateEventPageData, { CreateEventPageDataProps } from "@/app/(normal)/event/[grouphandle]/create/data"
import { selectLang } from "@/app/actions"
import CreateEventForm from '@/app/(normal)/event/[grouphandle]/create/CreateEventForm'

export default async function CreateEvent({ params }: { params: CreateEventPageDataProps }) {
    const pageData = await CreateEventPageData({ params})
    const { lang } = await selectLang()

    return <CreateEventForm
        data={pageData}
        lang={lang}
    />
}
