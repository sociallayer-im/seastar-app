import {
    Event, getEvents, EventListFilterProps, GroupDetail, EventWithJoinStatus
} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {
    analyzeGroupMembershipAndCheckProfilePermissions, getTimePropsFromRange,
    setEventIsOwnerStatus,
} from '@/utils'
import {GoogleMapMarkerProps} from '@/components/client/Map'
import {CLIENT_MODE} from '@/app/config'

export type GroupEventHomeParams = {
    grouphandle?: string
}

export const PAGE_SIZE = 10

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

    const [highlightedEvents, filteredEvents] = await Promise.all([
        getEvents({
            params: {
                filters: {
                    collection: undefined,
                    group_id: groupDetail.id.toString(),
                    ...getTimePropsFromRange(groupDetail.timezone || '', 'today'),
                    page: 1,
                    pinned: 1,
                },
                authToken, limit: 1000
            },
            clientMode: CLIENT_MODE,
        }),
        await getEvents({
            params: {filters: {...filterOpts, page: 1}, authToken, limit: PAGE_SIZE * (filterOpts.page ?? 1)},
            clientMode: CLIENT_MODE,
        })
    ])

    const eventsWithTrack = filteredEvents.map(e => {
        return {
            ...e,
            track: e.track_id ? groupDetail.tracks.find(t => t.id === e.track_id) : null
        } as EventWithJoinStatus
    })

    const highlightedEventsWithTrack = highlightedEvents.map(e => {
        return {
            ...e,
            track: e.track_id ? groupDetail.tracks.find(t => t.id === e.track_id) : null
        } as EventWithJoinStatus
    })

    if (Object.keys(searchParams).length === 0 && filteredEvents.length === 0) {
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
        highlightedEvents: setEventIsOwnerStatus({events: highlightedEventsWithTrack, currProfile}),
        events: setEventIsOwnerStatus({events: eventsWithTrack, currProfile}),
        members: [owner, ...managers, ...issuers, ...members],
        isManager,
        isOwner,
        isMember,
        isIssuer,
        canPublishEvent
    }
}
