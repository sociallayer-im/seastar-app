import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    checkProcess,
} from "@/utils"
import {redirect} from "next/navigation"
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {
    getEventDetailById,
    getEventForm,
    getGroupDetailByName, getPurchasedTicketItemsByProfileNameAndEventId, getRecurringById,
    Participant,
    Recurring, Ticket
} from '@sola/sdk'
import {AVNeeds, SeatingStyle, ExternalCatering} from '@/app/configForSpecifyGroup'
import {CLIENT_MODE} from '@/app/config'

export interface EventDetailPageDataProps {
    eventid: string
}

export interface EventDetailPageSearchParams {
    tab?: 'content' | 'tickets' | 'participants' | string[]
}


export interface EventDetailDataProps {
    params: EventDetailPageDataProps
    searchParams: EventDetailPageSearchParams
}

export default async function EventDetailPage(eventid: string, tab='content'){
    const currProfile = await getCurrProfile()

    const eventDetail = await getEventDetailById({
        params: {eventId: eventid, authToken: await getServerSideAuth()},
        clientMode: CLIENT_MODE
    })
    if (!eventDetail) {
        redirect('/404')
    }

    if (!eventDetail.group?.name) {
        redirect('/404')
    }

    const groupDetail = await getGroupDetailByName({
        params: {groupName: eventDetail.group.name},
        clientMode: CLIENT_MODE
    })
    if (!groupDetail) {
        redirect('/404')
    }

    const {
        isManager: isGroupManager,
        isMember: isGroupMember,
        isIssuer: isGroupIssuer,
        isOwner: isGroupOwner,
        canJoinEvent,
        canPublishEvent,
        canSubmitEvent
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)


    const groupHost = eventDetail.event_roles?.find(r => r.role === 'group_host')
    const customHost = eventDetail.event_roles?.find(r => r.role === 'custom_host')

    let filteredParticipants: Participant[]
    if (!eventDetail?.tickets?.length) {
        filteredParticipants = eventDetail.participants || []
    } else {
        // soon's ParticipantBlueprint doesn't expose ticket_id — a paid RSVP is
        // reflected in payment_status. Hide unpaid pending purchases.
        filteredParticipants = eventDetail.participants?.filter(participant =>
            !participant.payment_status || participant.payment_status === 'succeeded'
        ) || []
    }

    const currProfileParticipant = eventDetail.participants?.find((item: Participant) =>
        item.user.id === currProfile?.id)

    const currProfileAttended = !!currProfileParticipant
        && ['attending', 'pending'].includes(currProfileParticipant.status || '')
        && currProfileParticipant.payment_status !== 'pending'

    // Check-in is checked_in_at, NOT registered_at — the latter is stamped on
    // every RSVP, which made every registrant look checked in.
    const currProfileCheckedIn = !!currProfileParticipant && !!currProfileParticipant.checked_in_at

    const isEventCreator = !!eventDetail.owner && eventDetail.owner.id === currProfile?.id

    // check if the current user is an operator of the event, operator can edit the event
    const isEventOperator = !!currProfile
        && (isGroupManager
            || isEventCreator
            || eventDetail.event_roles?.some(role => role.role === 'co_host' && role.item_id === currProfile.id)
            || eventDetail.event_roles?.some(role => role.role === 'speaker' && role.item_id === currProfile.id)
            || eventDetail.event_roles?.some(role => role.role === 'custom_host' && role.item_id === currProfile.id)
        )


    const showParticipants = !eventDetail?.tickets?.length || isEventOperator

    // check if the current user can access the event
    const canAccess = (isEventOperator || canJoinEvent) && eventDetail.status !== 'cancelled' && eventDetail.status !== 'closed'

    // requirement_tags is not in soon's EventBlueprint — the tags-based
    // logistics hints only render when the backend starts emitting it.
    const requirementTags = (eventDetail as unknown as {requirement_tags?: string[]}).requirement_tags || []
    const seatingStyle = requirementTags.filter(tag => SeatingStyle.includes(tag))
    const avNeeds = requirementTags.filter(tag => AVNeeds.includes(tag))
    const externalCatering = requirementTags.filter(tag => ExternalCatering.includes(tag))

    let recurring: Recurring | null = null
    if (!!eventDetail.recurring_id) {
        recurring = await getRecurringById({params: {recurringId: eventDetail.recurring_id}, clientMode: CLIENT_MODE})
    }

    const ticketsPurchased: Ticket[] = []
    if (!!currProfile && !!eventDetail.tickets?.length) {
        const token = await getServerSideAuth()
        const ticketItems = await getPurchasedTicketItemsByProfileNameAndEventId({
            params: {profileName: currProfile.name, eventId: eventDetail.id, authToken: token!},
            clientMode: CLIENT_MODE
        })

        ticketItems.forEach(item => {
            const ticket = eventDetail.tickets?.find(t => t.id === item.ticket_id)
            !!ticket && ticketsPurchased.push(ticket)
        })
    }

    // eventDetail was fetched with the viewer's authToken (see getEventDetailById
    // above), so the backend already annotated it with is_starred for them.
    const currProfileStarred = !!currProfile && !!(eventDetail as unknown as {is_starred?: boolean}).is_starred

    // The registration form is fetched separately now (EventDetail carries form_id only).
    const form = eventDetail.form_id
        ? await getEventForm({params: {eventId: eventDetail.id}, clientMode: CLIENT_MODE})
        : null

    return {
        currProfile,
        eventDetail,
        groupDetail,
        recurring,
        form,
        isGroupOwner,
        isGroupManager,
        isGroupMember,
        isGroupIssuer,
        isEventOperator,
        isEventCreator,
        isEventClosed: eventDetail.status === 'closed',
        eventProcess: checkProcess(eventDetail.start_time, eventDetail.end_time),
        isTicketEvent: !!eventDetail.tickets?.length,
        currProfileAttended,
        currProfileCheckedIn,
        currProfileStarred,
        owner: eventDetail.owner,
        groupHost,
        customHost,
        tab,
        participants: filteredParticipants,
        showParticipants,
        canAccess,
        canPublishEvent: !!currProfile && canSubmitEvent,
        canViewAllSubmissions: !!currProfile && (isGroupManager || isGroupOwner || isEventCreator),
        ticketsPurchased,
        externalCatering,
        seatingStyle,
        avNeeds,
        enableGoogleMap: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_MAP === 'true',
    }
}

