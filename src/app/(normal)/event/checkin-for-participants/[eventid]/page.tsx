import {EventDetailDataProps} from '@/app/(normal)/event/detail/[eventid]/data'
import {selectLang} from '@/app/actions'
import CheckInData from '@/app/(normal)/event/checkin-for-participants/[eventid]/data'

export default async function CheckinForParticipants(props: EventDetailDataProps) {
    const {eventDetail} = await CheckInData(props)
    const {lang} = await selectLang()
    return <div className="page-width-sm !pt-12 !pb-12">
        <div className="w-full shadow p-4 rounded-lg">

        </div>
    </div>
}