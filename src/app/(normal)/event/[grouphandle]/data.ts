import {
    getGroupDetailByHandle,
    getProfileEventByHandle,
    Event, EventFilters, getEvents, EventListFilterProps
} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    setEventAttendedStatus,
} from '@/utils'

export type GroupEventHomeParams = {
    grouphandle?: string
}

export type GroupEventHomeSearchParams = Omit<EventListFilterProps, 'group_id' | 'timezone'>

export type GroupEventHomeDataProps = {
    params: GroupEventHomeParams
    searchParams: GroupEventHomeSearchParams
}

export interface GroupEventHomeDataWithHandleProps extends GroupEventHomeDataProps {
    groupHandle?: string
}


export default async function GroupEventHomeData({params, searchParams, groupHandle}: GroupEventHomeDataWithHandleProps) {
    const handle = groupHandle || params.grouphandle
    if (!handle) {
        redirect('/404')
    }

    const groupDetail = await getGroupDetailByHandle(handle)
    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    const {
        owner,
        managers,
        issuers,
        members,
        isManager,
        isOwner,
        isMember,
        isIssuer
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    if (!groupDetail) {
        redirect('/404')
    }

    const filterOpts: EventListFilterProps = {
        group_id: groupDetail.id.toString(),
        timezone: groupDetail.timezone || undefined,
        ...searchParams
    }
    if (!filterOpts.private_event && !filterOpts.collection) {
        filterOpts.collection = 'upcoming'
    }

    const authToken = await getServerSideAuth()
    const filteredEvents = await getEvents(filterOpts, authToken)
    let currProfileAttends: Event[] = []
    if (!!currProfile) {
        currProfileAttends = (await getProfileEventByHandle(handle)).attends
    }

    const eventWithStatus = setEventAttendedStatus({
        events: filteredEvents,
        currProfileAttends,
        currProfile
    })

    return {
        filterOpts,
        groupDetail,
        currProfile,
        events: eventWithStatus,
        members: [owner, ...managers, ...issuers, ...members],
        isManager,
        isOwner,
        isMember,
        isIssuer
    }
}
