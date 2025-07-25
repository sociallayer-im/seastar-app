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

export interface EventEditEventPageProps {
    params: { eventid: number }
    searchParams: { event_badge?: string }
}

export interface EditEventProps extends EventEditEventPageProps {
    checkPermissions?: boolean
}

export default async function EditEventData({params: {eventid}, searchParams: {event_badge}, checkPermissions=true}: EditEventProps) {
    const currProfile = await getCurrProfile()
    if (!currProfile && checkPermissions) {
        redirect('/')
    }

    let eventDetail = await getEventDetailById({params: {eventId: eventid}, clientMode: CLIENT_MODE})
    if (!eventDetail) {
        redirect('/404')
    }
    if (event_badge) {
        eventDetail = {
            ...eventDetail,
            badge_class_id: parseInt(event_badge)
        }
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

    const availableGroupHost = currProfile ? await getAvailableGroupsForEventHost({
        params: {profileHandle: currProfile.handle},
        clientMode: CLIENT_MODE
    }): []

    const availableHost: Array<Profile | Group> = currProfile
        ? eventDetail.owner.id === currProfile?.id ? [currProfile, ...availableGroupHost] : [eventDetail.owner, ...availableGroupHost]
        : []

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