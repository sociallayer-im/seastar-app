import {
    EventDraftType, getAvailableGroupsForEventHost,
    getEventDetailById,
    getGroupDetailByHandle, getRecurringById, Group,
    Profile, Recurring,
} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'
import {CreateEventPageDataType} from '@/app/(normal)/event/[grouphandle]/create/data'
import {CLIENT_MODE} from '@/app/config'

export interface EditEventProps {
    params: { eventid: number }
}

export default async function EditEventData({params: {eventid}}: EditEventProps) {
    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect('/')
    }

    const eventDetail = await getEventDetailById({params: {eventId: eventid}, clientMode: CLIENT_MODE})
    if (!eventDetail) {
        redirect('/404')
    }

    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: eventDetail.group.handle},
        clientMode: CLIENT_MODE
    })
    if (!groupDetail) {
        redirect('/404')
    }

    const {
        isManager,
        isOwner,
        isMember,
        isIssuer
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    const availableGroupHost = await getAvailableGroupsForEventHost({
        params: {profileHandle: currProfile.handle},
        clientMode: CLIENT_MODE
    })
    const availableHost: Array<Profile | Group> = [currProfile, ...availableGroupHost]

    let recurring: Recurring | null = null
    if (!!eventDetail.recurring_id) {
        recurring = await getRecurringById({
            params: {recurringId: eventDetail.recurring_id},
            clientMode: CLIENT_MODE
        })
    }

    return {
        currProfile,
        eventDraft: eventDetail as EventDraftType,
        recurring,
        groupDetail,
        memberships: groupDetail.memberships || [],
        isGroupOwner: isOwner,
        isGroupManager: isManager,
        isGroupMember: isMember,
        isGroupIssuer: isIssuer,
        availableHost,
        tracks: groupDetail?.tracks || [],
        venues: groupDetail?.venues || [],
        tags: groupDetail?.event_tags || [],
    } as CreateEventPageDataType
}