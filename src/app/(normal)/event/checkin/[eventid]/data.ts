import EventDetailPage, {EventDetailDataProps} from '@/app/(normal)/event/detail/[eventid]/data'
import {getEventParticipants} from '@sola/sdk'
import {getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'

export default async function CheckInData({params:{eventid}}: EventDetailDataProps) {
    const data =  await EventDetailPage(eventid)
    if (!data.currProfile) {
        redirect('/event/detail/' + data.eventDetail.id)
    }

    if (!data.currProfileAttended) {
        redirect('/event/detail/' + data.eventDetail.id)
    }

    // The shared loader deliberately fetches the event without its attendee
    // array; this page is one of the few that renders the list itself, so it
    // asks for it separately.
    const participants = await getEventParticipants({
        params: {eventId: data.eventDetail.id, authToken: await getServerSideAuth()},
        clientMode: CLIENT_MODE
    })

    return {...data, participants}
}
