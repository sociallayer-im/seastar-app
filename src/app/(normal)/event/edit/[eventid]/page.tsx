import {awaitProps, AsyncProps} from '@/utils'
import EditEventData, {EventEditEventPageProps} from '@/app/(normal)/event/edit/[eventid]/data'
import EditEventForm from '@/app/(normal)/event/edit/[eventid]/EditEventForm'
import {selectLang} from '@/app/actions'

export default async function EditEventPage(props: AsyncProps<EventEditEventPageProps>) {
    const data = await EditEventData(await awaitProps(props))
    const {lang} = await selectLang()


    return <EditEventForm lang={lang} data={data}/>
}