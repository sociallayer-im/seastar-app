import {getGroupDetailByHandle, TrackDetail} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'

export interface TrackCreateDataProps {
    params: { grouphandle: string }
}

export default async function TrackCreateData(props: TrackCreateDataProps) {
    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: props.params.grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect(`/event/${groupDetail.handle}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    if (!isManager) {
        redirect(`/event/${groupDetail.handle}`)
    }

    const emptyTrack = {
        title: '',
        kind: 'public',
        icon_url: null,
        about: null,
        group_id: groupDetail.id,
        start_date: null,
        end_date: null,
        manager_ids: null,
    } as TrackDetail

    return {
        currProfile,
        groupDetail,
        emptyTrack
    }
}
