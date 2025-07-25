import EditEventData, {EditEventProps} from '@/app/(normal)/event/edit/[eventid]/data'
import EditEventForm from '@/app/(normal)/event/edit/[eventid]/EditEventForm'
import {selectLang} from '@/app/actions'

export default async function EditEventPage(props: EditEventProps) {
    const data = await EditEventData({checkPermissions: false, ...props})
    const {lang} = await selectLang()


    return <EditEventForm lang={lang} data={data} redirect={false}/>
}