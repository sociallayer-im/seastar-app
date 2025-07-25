import EditEventData, {EventEditEventPageProps} from '@/app/(normal)/event/edit/[eventid]/data'
import EditEventForm from '@/app/(normal)/event/edit/[eventid]/EditEventForm'
import {selectLang} from '@/app/actions'

export default async function EditEventPage(props: EventEditEventPageProps) {
    const data = await EditEventData(props)
    const {lang} = await selectLang()


    return <EditEventForm lang={lang} data={data}/>
}