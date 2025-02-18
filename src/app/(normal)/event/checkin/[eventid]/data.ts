import EventDetailPage, {EventDetailDataProps} from '@/app/(normal)/event/detail/[eventid]/data'
import {redirect} from 'next/navigation'

export default async function CheckInData({params:{eventid}}: EventDetailDataProps) {
    const data =  await EventDetailPage(eventid)
    if (!data.currProfile) {
        redirect('/event/detail/' + data.eventDetail.id)
    }

    if (!data.currProfileAttended) {
        redirect('/event/detail/' + data.eventDetail.id)
    }

    return data
}