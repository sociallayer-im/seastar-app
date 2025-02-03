import {EventDetailDataProps} from '@/app/(normal)/event/detail/[eventid]/data'
import {selectLang} from '@/app/actions'
import CheckInData from '@/app/(normal)/event/checkin/[eventid]/data'
import EventParticipantList from '@/components/client/EventParticipantList'
import {headers} from 'next/headers'
import QrCode from '@/components/client/QRcode'

export default async function Checkin(props: EventDetailDataProps) {
    const {eventDetail, isEventOperator, currProfile} = await CheckInData(props)
    const {lang} = await selectLang()

    const currPath = headers().get('x-current-path')
    const qrcodeText = `${new URL(currPath!).origin}/event/checkin-for-participants/${eventDetail.id}?profile_id=${currProfile!.id}`

    return <div className="page-width-sm !pt-3 !pb-12">
        <div className="text-lg font-semibold text-center my-3">{lang['Check-In']}</div>
        <div className="w-full shadow py-6 rounded-lg mb-8 flex-col flex items-center">
            <QrCode text={qrcodeText} size={[200, 200]} />
            <div className="text-lg font-semibold text-center mt-3">{eventDetail.title}</div>
        </div>

        <div className="font-semibold text-lg"> {lang['Participants']} <span
            className="text-sm">({eventDetail.participants?.length})</span></div>
        <EventParticipantList
            lang={lang}
            isEventOperator={isEventOperator}
            currProfile={currProfile}
            eventDetail={eventDetail}
        />
    </div>
}