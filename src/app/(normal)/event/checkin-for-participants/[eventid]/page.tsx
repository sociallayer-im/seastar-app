import {EventDetailDataProps} from '@/app/(normal)/event/detail/[eventid]/data'
import {selectLang} from '@/app/actions'
import CheckInData from '@/app/(normal)/event/checkin-for-participants/[eventid]/data'
import EventParticipantList from '@/components/client/EventParticipantList'
import {eventCoverTimeStr} from '@/utils'
import CheckinBtn from '@/app/(normal)/event/checkin-for-participants/[eventid]/CheckinBtn'
import QrCode from '@/components/client/QRcode'

export default async function CheckinForParticipants(props: EventDetailDataProps) {
    const {eventDetail, isEventOperator, currProfile} = await CheckInData(props)
    const {lang} = await selectLang()

    return <div className="page-width-sm !pt-3 !pb-12">
        <div className="text-lg font-semibold text-center my-3">{lang['Check-In For Participants']}</div>
        <div className="w-full shadow py-6 rounded-lg mb-8 flex-col flex items-center">
            {!!eventDetail.cover_url
                ? <img src={eventDetail.cover_url}
                       className="block max-h-[200px] max-w-[295px] mx-auto rounded-lg" alt=""/>
                : <div className="flex-shrink-0 w-[200px] h-[200px] overflow-hidden mx-auto">
                    <div className="default-cover w-[452px] h-[452px]" style={{transform: 'scale(0.44)'}}>
                        <div
                            className="font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                            {eventDetail.title || lang['Event Name']}
                        </div>
                        <div
                            className="text-lg absolute font-semibold left-[76px] top-[178px]">{eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).date}
                            <br/>
                            {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).time}
                        </div>
                        <div
                            className="text-lg absolute font-semibold left-[76px] top-[240px]">{eventDetail.location}</div>
                    </div>
                </div>
            }

            <div className="text-lg font-semibold text-center mt-3">{eventDetail.title}</div>

            <CheckinBtn eventDetail={eventDetail} lang={lang}/>
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