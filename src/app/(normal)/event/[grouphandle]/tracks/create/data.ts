import {getGroupDetailByName, TrackDetail} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'

export interface TrackCreateDataProps {
    params: { grouphandle: string }
}

export default async function TrackCreateData(props: TrackCreateDataProps) {
    const groupDetail = await getGroupDetailByName({
        params: {groupName: props.params.grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect(`/event/${groupDetail.name}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    if (!isManager) {
        redirect(`/event/${groupDetail.name}`)
    }

    const emptyTrack = {
        title: '',
        is_private: false,
        image_url: null,
        description: null,
        group_id: groupDetail.id,
        start_date: null,
        end_date: null,
        track_roles: [],
    } as unknown as TrackDetail

    return {
        currProfile,
        groupDetail,
        emptyTrack
    }
}
