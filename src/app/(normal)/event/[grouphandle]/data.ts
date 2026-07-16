import {
    getEvents, EventListFilterProps, GroupDetail, EventWithJoinStatus
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

export const PAGE_SIZE = 25

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
        canPublishEvent,
        canSubmitEvent
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    const filterOpts: EventListFilterProps = {
        group_id: groupDetail.id,
        timezone: groupDetail.timezone || undefined,
        ...searchParams
    }
    if (!filterOpts.collection) {
        filterOpts.collection = 'upcoming'
    }

    const authToken = await getServerSideAuth()

    const [highlightedEvents, filteredEvents] = await Promise.all([
        getEvents({
            params: {
                filters: {
                    collection: undefined,
                    group_id: groupDetail.id,
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

    // Events already embed their track (soon EventBlueprint).
    const eventsWithTrack = filteredEvents as EventWithJoinStatus[]

    const highlightedEventsWithTrack = highlightedEvents
        .filter(e => {
            // check the event is past
            return new Date(e.end_time).getTime() >= new Date().getTime()
        }) as EventWithJoinStatus[]

    if (Object.keys(searchParams).length === 0 && filteredEvents.length === 0) {
        const pastEvents = await getEvents({
            params: {filters: {...filterOpts, page: 1, collection: 'past'}, authToken, limit: PAGE_SIZE * (filterOpts.page ?? 1)},
            clientMode: CLIENT_MODE,
        })
        if (!!pastEvents.length) {
            redirect(`/event/${groupDetail.name}?collection=past`)
        }
    }

    // Geo now lives on each event's place.
    const mapMarkers: GoogleMapMarkerProps[] = []
    const mapEvents = filteredEvents.filter((e) => e.place?.latitude && e.place?.longitude)
    mapEvents.reverse().forEach((event) => {
        if (!mapMarkers.find((m) => {
            return m.position.lng === event.place!.longitude! && m.position.lat === event.place!.latitude!
        })) {
            mapMarkers.push({
                position: {
                    lat: event.place!.latitude!,
                    lng: event.place!.longitude!
                },
                title: event.title,
            })
        }
    })

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
        canPublishEvent,
        canSubmitEvent,
        enableGoogleMap: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_MAP === 'true',
    }
}
