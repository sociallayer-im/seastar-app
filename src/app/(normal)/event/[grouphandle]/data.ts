import {
    getGroupDetailByHandle,
    getProfileEventByHandle,
    Event, EventFilters, getEvents, EventListFilterProps, getMapEvents
} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    setEventAttendedStatus,
} from '@/utils'
import {GoogleMapMarkerProps} from '@/components/client/Map'
import {CLIENT_MODE} from '@/app/config'

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

export default async function GroupEventHomeData({
                                                     params,
                                                     searchParams,
                                                     groupHandle
                                                 }: GroupEventHomeDataWithHandleProps) {
    const handle = groupHandle || params.grouphandle
    if (!handle) {
        redirect('/404')
    }

    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: handle},
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
        isIssuer,
        canPublishEvent
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    const filterOpts: EventListFilterProps = {
        group_id: groupDetail.id.toString(),
        timezone: groupDetail.timezone || undefined,
        ...searchParams
    }
    if (!filterOpts.private_event && !filterOpts.collection) {
        filterOpts.collection = 'upcoming'
    }

    const authToken = await getServerSideAuth()
    const filteredEvents = await getEvents({
        params: {filters: filterOpts, authToken},
        clientMode: CLIENT_MODE
    })
    let currProfileAttends: Event[] = []
    if (!!currProfile) {
        currProfileAttends = (await getProfileEventByHandle({
            params: {handle: handle},
            clientMode: CLIENT_MODE
        })).attends
    }

    const eventWithStatus = setEventAttendedStatus({
        events: filteredEvents,
        currProfileAttends,
        currProfile
    })

    let mapMarkers: GoogleMapMarkerProps[] = []
    if (groupDetail.map_enabled) {
        const mapEvents = await getMapEvents({
            params: {groupHandle: groupDetail.handle},
            clientMode: CLIENT_MODE
        })
        mapEvents.reverse().forEach((event: Event) => {
            if (!mapMarkers.find((m) => {
                return m.position.lng === event.geo_lng! && m.position.lat === event.geo_lng!
            })) {
                mapMarkers.push({
                    position: {
                        lat: event.geo_lat!,
                        lng: event.geo_lng!
                    },
                    title: event.title,
                })
            }
        })
    }

    return {
        mapMarkers,
        filterOpts,
        groupDetail,
        currProfile,
        events: eventWithStatus,
        members: [owner, ...managers, ...issuers, ...members],
        isManager,
        isOwner,
        isMember,
        isIssuer,
        canPublishEvent
    }
}
