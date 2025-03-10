import {
    getGroupDetailByHandle,
    Event, getEvents, EventListFilterProps, GroupDetail
} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    setEventIsOwnerStatus,
} from '@/utils'
import {GoogleMapMarkerProps} from '@/components/client/Map'
import {CLIENT_MODE} from '@/app/config'

export type GroupEventHomeParams = {
    grouphandle?: string
}

export type GroupEventHomeSearchParams = Omit<EventListFilterProps, 'group_id' | 'timezone'>

export type GroupEventHomeDataProps = {
    searchParams: GroupEventHomeSearchParams
    groupDetail?: GroupDetail | null
}

export default async function GroupEventHomeData({
                                                     searchParams,
                                                     groupDetail
                                                 }: GroupEventHomeDataProps) {
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


    if (Object.keys(searchParams).length === 0 && filteredEvents.length === 0 ) {
        redirect(`/event/${groupDetail.handle}?collection=past`)
    }

    let mapMarkers: GoogleMapMarkerProps[] = []
    if (groupDetail.map_enabled) {
        const mapEvents = filteredEvents.filter((e) => e.geo_lat && e.geo_lng)
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
        events: setEventIsOwnerStatus({events: filteredEvents, currProfile}),
        members: [owner, ...managers, ...issuers, ...members],
        isManager,
        isOwner,
        isMember,
        isIssuer,
        canPublishEvent
    }
}
