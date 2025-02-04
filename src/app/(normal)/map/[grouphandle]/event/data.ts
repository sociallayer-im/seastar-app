import {Event, getEvents, getGroupDetailByHandle, getMapEvents, getProfileEventByHandle} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions, pickSearchParam, setEventAttendedStatus} from '@/utils'

export type GroupEventMapParams = {
    grouphandle: string
}

export type GroupEventMapSearchParams = {
    event?: string | string[]
}


export type GroupEventMapDataProps = {
    params: GroupEventMapParams
    searchParams: GroupEventMapSearchParams
}

export default async function GroupEventMapData({params, searchParams}: GroupEventMapDataProps) {
    const groupHandle = params.grouphandle
    const groupDetail = await getGroupDetailByHandle(groupHandle)
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

    const filteredEvents = await getEvents({
        group_id: groupDetail.id.toString(),
        collection: 'upcoming',
        timezone: groupDetail.timezone!,
    }, (await getServerSideAuth()) || undefined)

    let currProfileAttends: Event[] = []
    if (!!currProfile) {
        currProfileAttends = (await getProfileEventByHandle(currProfile.handle)).attends
    }

    const eventWithStatus = setEventAttendedStatus({
        events: filteredEvents,
        currProfileAttends,
        currProfile
    })

    const targetEventId = pickSearchParam(searchParams.event) ? parseInt(pickSearchParam(searchParams.event)!) : undefined

    return {
        groupDetail,
        currProfile,
        events: eventWithStatus,
        members: [owner, ...managers, ...issuers, ...members],
        isManager,
        isOwner,
        isMember,
        isIssuer,
        targetEventId,
    }
}