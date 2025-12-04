import {
  analyzeGroupMembershipAndCheckProfilePermissions,
  getPrefillEventDateTime,
} from "@/utils"
import { redirect } from "next/navigation"
import { getCurrProfile } from "@/app/actions"
import {
  getGroupDetailByHandle,
  Group,
  PaymentMethod,
  Profile,
  TicketDraft,
  GroupDetail,
  Membership,
  Track,
  EventDraftType,
  VenueDetail,
  getAvailableGroupsForEventHost,
  Recurring,
  ProfileDetail,
  getTrackRolesByTrackIds,
  getGroupDetailById,
} from "@sola/sdk"
import { CLIENT_MODE } from "@/app/config"

export interface CreateEventPageDataProps {
  grouphandle: string
}

export interface CreateEventDataProps {
  params: CreateEventPageDataProps
}

export interface CreateEventPageDataType {
  currProfile: ProfileDetail
  eventDraft: EventDraftType
  groupDetail: GroupDetail
  memberships: Membership[]
  isGroupOwner: boolean
  isGroupManager: boolean
  isGroupMember: boolean
  isGroupIssuer: boolean
  availableHost: Array<Profile>
  tracks: Track[]
  venues: VenueDetail[]
  tags: string[]
  recurring: Recurring | null
  unionVenues: VenueDetail[]
}

export const emptyEvent: EventDraftType = {
  group_id: 0,
  cover_url: "",
  title: "",
  track_id: null,
  content: "",
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
  meeting_url: "",
  event_roles: [],
  tags: [],
  max_participant: null,
  display: "normal",
  pinned: false,
  status: "open",
  badge_class_id: null,
  tickets: [],
  recurring_id: null,
  requirement_tags: [],
  kind: null
}

export const emptyPaymentMethod: PaymentMethod = {
  item_type: "Ticket",
  chain: "",
  token_name: null,
  token_address: null,
  receiver_address: "",
  price: 1,
  protocol: "",
}

export const emptyTicket: TicketDraft = {
  title: "",
  content: "",
  check_badge_class_id: null,
  quantity: null,
  end_time: null,
  payment_methods: [],
  tracks_allowed: [],
  ticket_type: "event",
}

export default async function CreateEventPageData({
  params,
}: CreateEventDataProps) {
  const currProfile = await getCurrProfile()
  if (!currProfile) {
    redirect("/")
  }

  const groupDetail = await getGroupDetailByHandle({
    params: { groupHandle: params.grouphandle },
    clientMode: CLIENT_MODE,
  })

  if (!groupDetail) {
    redirect("/404")
  }

  const { isManager, isOwner, isMember, isIssuer } =
    analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

  const availableGroupHost = await getAvailableGroupsForEventHost({
    params: { profileHandle: currProfile.handle },
    clientMode: CLIENT_MODE,
  })
  const availableHost: Array<Profile | Group> = [
    currProfile,
    ...availableGroupHost,
  ]

  const availableTrackIds = groupDetail.tracks?.map((track) => track.id) || []
  const trackRoles = await getTrackRolesByTrackIds({
    params: { trackIds: availableTrackIds },
    clientMode: CLIENT_MODE,
  })
  const availableVenues = (groupDetail?.venues || []).filter(
    (venue) =>
      isOwner ||
      isManager ||
      !venue.track_ids ||
      venue.track_ids.length === 0 ||
      venue.track_ids.some((trackId) =>
        trackRoles
          .filter((role) => role.track_id === trackId)
          .some((role) => role.profile_id === currProfile.id)
      )
  )

  let unionVenues:VenueDetail[] = []
  if (groupDetail.venue_union) {
    const unionGroups = await Promise.all(groupDetail.venue_union.map(async (groupId) => {
      const group = await getGroupDetailById({
        params: { groupId },
        clientMode: CLIENT_MODE,
      })
      return group
    }))
    unionVenues = unionGroups.map((group) => group?.venues || []).flat()
  }

  return {
    currProfile,
    recurring: null,
    eventDraft: {
      ...emptyEvent,
      group_id: groupDetail.id,
      timezone: groupDetail.timezone,
    },
    groupDetail,
    memberships: groupDetail.memberships || [],
    isGroupOwner: isOwner,
    isGroupManager: isManager,
    isGroupMember: isMember,
    isGroupIssuer: isIssuer,
    availableHost,
    tracks: groupDetail?.tracks || [],
    venues: availableVenues,
    tags: groupDetail?.event_tags || [],
    unionVenues,
  } as CreateEventPageDataType
}
