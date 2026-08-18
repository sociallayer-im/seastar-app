import EditEventData, {EventEditEventPageProps} from '@/app/(normal)/event/edit/[eventid]/data'
import EditEventForm from '@/app/(normal)/event/edit/[eventid]/EditEventForm'
import {selectLang} from '@/app/actions'

export default async function EditEventPage(props: EventEditEventPageProps) {
    const data = await EditEventData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    const {lang} = await selectLang()


    return <EditEventForm lang={lang} data={data}/>
}