import {analyzeGroupMembershipAndCheckProfilePermissions, AUTH_FIELD, getPrefillEventDateTime} from "@/utils"
import {redirect} from "next/navigation"
import {getCurrProfile} from '@/app/actions'
import {
    getGroupDetailByHandle,
    Group,
    PaymentMethod,
    Profile,
    EventDetail,
    TicketDraft,
    GroupDetail,
    Membership,
    Track, Venue,
    EventDraftType, VenueDetail
} from '@sola/sdk'

export interface CreateEventPageDataProps {
    grouphandle: string
}

export interface CreateEventDataProps {
    params: CreateEventPageDataProps
}

export interface CreateEventPageDataType {
    currProfile: Profile
    eventDraft: EventDraftType
    groupDetail: GroupDetail
    memberships: Membership[]
    isGroupOwner: boolean
    isGroupManager: boolean
    isGroupMember: boolean
    isGroupIssuer: boolean
    availableHost: Array<Profile>
    tracks: Track[],
    venues: VenueDetail[],
    tags: string[],
}

export const emptyEvent: EventDraftType = {
    id: 0,
    cover_url: '',
    title: '',
    track_id: null,
    content: '',
    notes: null,
    venue_id: null,
    geo_lat: null,
    geo_lng: null,
    formatted_address: null,
    location: null,
    location_data: null,
    start_time: getPrefillEventDateTime().initStartTime.toISOString(),
    end_time: getPrefillEventDateTime().initEndTime.toISOString(),
    timezone: null,
    meeting_url: '',
    event_roles: [],
    tags: [],
    max_participant: null,
    display: 'normal',
    pinned: false,
    status: 'open',
    badge_class_id: null,
    tickets: [],
    ticket_attributes: []
}

export const emptyPaymentMethod: PaymentMethod = {
    id: 0,
    item_type: 'Ticket',
    chain: '',
    token_name: null,
    token_address: null,
    receiver_address: '',
    price: 1,
    protocol: ''
}

export const emptyTicket: TicketDraft = {
    id: 0,
    title: '',
    content: '',
    check_badge_class_id: null,
    quantity: null,
    end_time: null,
    payment_methods: [],
    tracks_allowed: [],
    ticket_type: 'event'
}

export default async function CreateEventPageData({params}: CreateEventDataProps) {
    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect('/')
    }

    const groupDetail = await getGroupDetailByHandle(params.grouphandle)

    if (!groupDetail) {
        redirect('/404')
    }

    const {
        isManager,
        isOwner,
        isMember,
        isIssuer
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    const availableHost: Array<Profile | Group> = [currProfile]

    return {
        currProfile,
        eventDraft: emptyEvent,
        groupDetail,
        memberships: groupDetail.memberships || [],
        isGroupOwner: isOwner,
        isGroupManager: isManager,
        isGroupMember: isMember,
        isGroupIssuer: isIssuer,
        availableHost,
        tracks:groupDetail?.tracks || [],
        venues: groupDetail?.venues || [],
        tags: groupDetail?.event_tags || [],
    } as CreateEventPageDataType
}





