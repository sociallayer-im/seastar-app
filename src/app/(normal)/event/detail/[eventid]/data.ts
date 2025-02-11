import {
    analyzeGroupMembershipAndCheckProfilePermissions,
    checkProcess,
    EventWithJoinStatus,
    pickSearchParam
} from "@/utils"
import {redirect} from "next/navigation"
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {
    Event,
    getEventByRecurringId,
    getEventDetailById,
    getGroupDetailByHandle, getPurchasedTicketItemsByProfileHandleAndEventId, getRecurringById, getStaredEvent,
    Participant,
    Recurring, Ticket
} from '@sola/sdk'
import {AVNeeds, SeatingStyle} from '@/app/configForSpecifyGroup'
import {CLIENT_MODE} from '@/app/config'

export interface EventDetailPageDataProps {
    eventid: string
}

export interface EventDetailPageSearchParams {
    tab?: 'content' | 'tickets' | 'comments' | 'participants' | string[]
}


export interface EventDetailDataProps {
    params: EventDetailPageDataProps
    searchParams: EventDetailPageSearchParams
}

export default async function EventDetailPage({params, searchParams}: EventDetailDataProps) {
    const currProfile = await getCurrProfile()

    const eventDetail = await getEventDetailById({
        params: {eventId: parseInt(params.eventid)},
        clientMode: CLIENT_MODE
    })
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
        isManager: isGroupManager,
        isMember: isGroupMember,
        isIssuer: isGroupIssuer,
        isOwner: isGroupOwner,
        canJoinEvent
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)


    const groupHost = eventDetail.event_roles?.find(r => r.role === 'group_host')

    let filteredParticipants: Participant[]
    if (!eventDetail?.tickets?.length) {
        filteredParticipants = eventDetail.participants || []
    } else {
        filteredParticipants = eventDetail.participants?.filter(participant => {
            if (!participant.ticket_id) return true
            const ticket = eventDetail.tickets?.find(t => t.id === participant.ticket_id)
            if (ticket!.payment_methods.length === 0) {
                return true
            } else return participant.payment_status === 'succeeded'
        }) || []
    }

    const currProfileAttended = !!eventDetail.participants?.find((item: Participant) => {
        const ticket = eventDetail.tickets?.find(t => t.id === item.ticket_id)
        return (!item.ticket_id && item.profile.id === currProfile?.id && (item.status === 'applied' || item.status === 'attending' || item.status === 'checked')) // no tickets needed
            || (!!ticket && !!item.ticket_id && item.profile.id === currProfile?.id && (item.status === 'applied' || item.status === 'attending' || item.status === 'checked') && item.payment_status?.includes('succe')) // paid ticket
            || (!!ticket && !!item.ticket_id && item.profile.id === currProfile?.id && (item.status === 'applied' || item.status === 'attending' || item.status === 'checked') && ticket.payment_methods.length === 0) // free ticket
    })

    const currProfileCheckedIn = eventDetail.participants?.find((item: Participant) => {
        return item.profile.id === currProfile?.id && item.status === 'checked'
    })

    const isEventCreator = eventDetail.owner.id === currProfile?.id

    // check if the current user is an operator of the event, operator can edit the event
    const isEventOperator = !!currProfile
        && (isGroupManager
            || isEventCreator
            || eventDetail.event_roles?.some(role => role.role === 'co_host' && role.item_id === currProfile.id)
            || eventDetail.event_roles?.some(role => role.role === 'speaker' && role.item_id === currProfile.id)
        )


    const showParticipants = !eventDetail?.tickets?.length || isEventOperator

    // check if the current user can access the event
    const canAccess = isEventOperator || canJoinEvent

    const seatingStyle = eventDetail.requirement_tags?.filter(tag => SeatingStyle.includes(tag))
    const avNeeds = eventDetail.requirement_tags?.filter(tag => AVNeeds.includes(tag))

    let recurring: Recurring | null = null
    if (!!eventDetail.recurring_id) {
        recurring = await getRecurringById({params: {recurringId: eventDetail.recurring_id}, clientMode: CLIENT_MODE})
    }

    let ticketsPurchased: Ticket[] = []
    if (!!currProfile && !!eventDetail.tickets?.length) {
        const ticketItems = await getPurchasedTicketItemsByProfileHandleAndEventId({
            params: {profileHandle: currProfile.handle, eventId: eventDetail.id},
            clientMode: CLIENT_MODE
        })

        ticketItems.forEach(item => {
            const ticket = eventDetail.tickets?.find(t => t.id === item.ticket_id)
            !!ticket && ticketsPurchased.push(ticket)
        })
    }

    let currProfileStarred = false
    if (!!currProfile) {
        const token = await getServerSideAuth()
        const starredEvents = await getStaredEvent({
            params: {authToken: token!},
            clientMode: CLIENT_MODE
        })
        currProfileStarred = !!starredEvents.find(e => e.id === eventDetail.id)
    }

    return {
        currProfile,
        eventDetail,
        groupDetail,
        recurring,
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
        isOwner: eventDetail.owner.id === currProfile?.id,
        owner: eventDetail.owner,
        groupHost,
        tab: pickSearchParam(searchParams.tab) || 'content',
        participants: filteredParticipants,
        showParticipants,
        canAccess,
        ticketsPurchased,

        seatingStyle,
        avNeeds
    }
}


