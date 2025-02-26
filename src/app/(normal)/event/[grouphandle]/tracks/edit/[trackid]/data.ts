import {getGroupDetailById, getTrackDetailById} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'

export interface TrackDetailDataProps {
    params: { trackid: string }
}

export default async function TrackDetailData({params: {trackid}}: TrackDetailDataProps) {
    const trackDetail = await getTrackDetailById({
        params: {
            trackId: parseInt(trackid)
        }, clientMode: CLIENT_MODE
    })

    if (!trackDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/')
    }

    const groupDetail = await getGroupDetailById({
        params: {groupId: trackDetail.group_id},
        clientMode: CLIENT_MODE
    })

    return {trackDetail, currProfile, groupDetail}
}