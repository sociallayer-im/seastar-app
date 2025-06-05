import {Event, getEvents, getGroupDetailByHandle, getProfileEventByHandle} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions, pickSearchParam, setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

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
    if (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_MAP !== 'true') redirect('/')

    const groupHandle = params.grouphandle
    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle},
        clientMode: CLIENT_MODE
    })
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
        params: {
            filters: {
                group_id: groupDetail.id.toString(),
                collection: 'upcoming',
                timezone: groupDetail.timezone!,
            }, authToken: (await getServerSideAuth()) || undefined
        }, clientMode: CLIENT_MODE
    })

    let currProfileAttends: Event[] = []
    let currProfileStarred: Event[] = []
    if (!!currProfile) {
        const {attends, starred} = await getProfileEventByHandle({
            params: {handle: currProfile.handle},
            clientMode: CLIENT_MODE
        })
        currProfileAttends = attends
        currProfileStarred = starred
    }

    const eventWithStatus = setEventAttendedStatus({
        events: filteredEvents,
        currProfileAttends,
        currProfileStarred,
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