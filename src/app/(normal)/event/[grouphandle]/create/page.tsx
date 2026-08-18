import CreateEventPageData, { CreateEventPageDataProps } from "@/app/(normal)/event/[grouphandle]/create/data"
import { selectLang } from "@/app/actions"

import CreateEventForm from '@/app/(normal)/event/[grouphandle]/create/CreateEventFormClientOnly'

export default async function CreateEvent(props: { params: Promise<CreateEventPageDataProps> }) {
    const params = await props.params
    const pageData = await CreateEventPageData({ params})
    const { lang } = await selectLang()

    return <CreateEventForm
        data={pageData}
        lang={lang}
    />
}
