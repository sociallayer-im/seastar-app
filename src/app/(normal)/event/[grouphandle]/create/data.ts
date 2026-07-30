import {
  analyzeGroupMembershipAndCheckProfilePermissions,
  getPrefillEventDateTime,
} from "@/utils"
import { redirect } from "next/navigation"
import { getCurrProfile, getServerSideAuth } from "@/app/actions"
import {
  getGroupDetailByName,
  getVenueDetailById,
  Group,
  PaymentMethod,
  Profile,
  TicketDraft,
  GroupDetail,
  Membership,
  Track,
  EventDraftType,
  VenueDetail,
  Venue,
  getAvailableGroupsForEventHost,
  getTrackDetailById,
  Recurring,
  ProfileDetail,
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
  availableHost: Array<Profile | Group>
  tracks: Track[]
  venues: VenueDetail[]
  tags: string[]
  recurring: Recurring | null
}

export const emptyEvent: EventDraftType = {
  group_id: "",
  image_url: "",
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
  pinned: false,
  require_approval: null,
  status: "published",
  tickets: [],
  recurring_id: null,
  requirement_tags: [],
  kind: null
}

export const emptyPaymentMethod: PaymentMethod = {
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

/**
 * Venues restricted to specific tracks are only offered to managers or users
 * holding a role in one of those tracks (roles come from each track's
 * :with_roles detail).
 */
export async function filterVenuesForProfile(
  groupDetail: GroupDetail,
  currProfile: Profile | null | undefined,
  isManager: boolean,
  authToken?: string
): Promise<VenueDetail[]> {
  // The group payload embeds the light Venue view; the event form needs
  // availabilities/track_ids, so hydrate each venue's detail. Both callers are
  // signed in, so the token goes along.
  const lightVenues = (groupDetail.venues || []) as Venue[]
  const venues = (await Promise.all(lightVenues.map(v =>
    getVenueDetailById({ params: { venueId: v.id, authToken }, clientMode: CLIENT_MODE }).catch(() => null)
  ))).filter(Boolean) as VenueDetail[]
  if (isManager) return venues

  const restrictedTrackIds = Array.from(new Set(
    venues.flatMap(v => v.track_ids || [])
  ))
  const myTrackIds = new Set<string>()
  if (currProfile && restrictedTrackIds.length) {
    const details = await Promise.all(restrictedTrackIds.map(trackId =>
      getTrackDetailById({ params: { trackId }, clientMode: CLIENT_MODE }).catch(() => null)
    ))
    details.forEach(track => {
      if (track?.track_roles?.some(role => role.user.id === currProfile.id)) {
        myTrackIds.add(track.id)
      }
    })
  }

  return venues.filter(venue =>
    !venue.track_ids ||
    venue.track_ids.length === 0 ||
    venue.track_ids.some(trackId => myTrackIds.has(trackId))
  )
}

export default async function CreateEventPageData({
  params,
}: CreateEventDataProps) {
  const currProfile = await getCurrProfile()
  if (!currProfile) {
    redirect("/")
  }

  const groupDetail = await getGroupDetailByName({
    params: { groupName: params.grouphandle },
    clientMode: CLIENT_MODE,
  })

  if (!groupDetail) {
    redirect("/404")
  }

  const { isManager, isOwner, isMember, isIssuer } =
    analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

  const availableGroupHost = await getAvailableGroupsForEventHost({
    params: { profileName: currProfile.name },
    clientMode: CLIENT_MODE,
  })
  const availableHost: Array<Profile | Group> = [
    currProfile,
    ...availableGroupHost,
  ]

  const availableVenues = await filterVenuesForProfile(groupDetail, currProfile, isOwner || isManager, await getServerSideAuth())

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
    tags: groupDetail?.event_tag_list || [],
  } as CreateEventPageDataType
}
