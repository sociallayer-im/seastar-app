import {
  EventDraftType,
  getAvailableGroupsForEventHost,
  getEventDetailById,
  getEventForm,
  getGroupDetailByName,
  getRecurringById,
  Group,
  Profile,
  Recurring,
  EventDetail,
} from "@sola/sdk"
import { getCurrProfile, getServerSideAuth } from "@/app/actions"
import { redirect } from "next/navigation"
import { analyzeGroupMembershipAndCheckProfilePermissions } from "@/utils"
import { CreateEventPageDataType, filterVenuesForProfile } from "@/app/(normal)/event/[grouphandle]/create/data"
import { CLIENT_MODE } from "@/app/config"

export interface EventEditEventPageProps {
  params: { eventid: string }
  searchParams: { event_badge?: string }
}

export interface EditEventProps extends EventEditEventPageProps {
  checkPermissions?: boolean
}

/**
 * The editor's draft holds flat ids + location fields; the API detail carries
 * nested objects — convert here.
 */
function toEventDraft(eventDetail: EventDetail): EventDraftType {
  return {
    id: eventDetail.id,
    title: eventDetail.title,
    content: eventDetail.content,
    start_time: eventDetail.start_time,
    end_time: eventDetail.end_time,
    timezone: eventDetail.timezone,
    status: eventDetail.status,
    visibility: eventDetail.visibility,
    group_id: eventDetail.group!.id,
    venue_id: eventDetail.venue?.id || null,
    track_id: eventDetail.track?.id || null,
    meeting_url: eventDetail.meeting_url,
    external_url: eventDetail.external_url,
    max_participant: eventDetail.max_participant,
    require_approval: eventDetail.require_approval,
    category: eventDetail.category,
    kind: eventDetail.kind,
    tags: eventDetail.tags,
    pinned: eventDetail.pinned,
    image_url: eventDetail.image_url,
    notes: eventDetail.notes,
    image_note: eventDetail.image_note,
    recurring_id: eventDetail.recurring_id,
    form_id: eventDetail.form_id,
    tickets: (eventDetail.tickets || []).map(t => ({ ...t, payment_methods: t.payment_methods || [] })),
    event_roles: eventDetail.event_roles || [],
    location: eventDetail.place?.name || null,
    formatted_address: eventDetail.place?.address || null,
    geo_lat: eventDetail.place?.latitude ?? null,
    geo_lng: eventDetail.place?.longitude ?? null,
    location_data: eventDetail.place?.data?.place_id || null,
  }
}

export default async function EditEventData({
  params: { eventid },
  checkPermissions = true,
}: EditEventProps) {
  const [currProfile, eventDetail] = await Promise.all([
    getCurrProfile(),
    getEventDetailById({
      params: { eventId: eventid },
      clientMode: CLIENT_MODE,
    }),
  ])
  if (!currProfile && checkPermissions) {
    redirect("/")
  }
  if (!eventDetail) {
    redirect("/404")
  }

  const groupDetail = await getGroupDetailByName({
    params: { groupName: eventDetail.group!.name },
    clientMode: CLIENT_MODE,
  })
  if (!groupDetail) {
    redirect("/404")
  }

  const { isManager, isOwner, isMember, isIssuer } =
    analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

  const authToken = await getServerSideAuth()

  // Host list, recurrence, venue filter and the application form are four
  // independent reads — one round trip instead of four.
  const [availableGroupHost, recurring, availableVenues, form] = await Promise.all([
    currProfile
      ? getAvailableGroupsForEventHost({
          params: { profileName: currProfile.name },
          clientMode: CLIENT_MODE,
        })
      : Promise.resolve([]),
    eventDetail.recurring_id
      ? getRecurringById({
          params: { recurringId: eventDetail.recurring_id },
          clientMode: CLIENT_MODE,
        })
      : Promise.resolve(null as Recurring | null),
    filterVenuesForProfile(groupDetail, currProfile, isOwner || isManager, authToken),
    // Without this the editor showed the application-form section switched off
    // on an event that has one, so an organizer opening the page saw their
    // questions vanish — and building them again replaced the originals, taking
    // the answers already given with them.
    eventDetail.form_id
      ? getEventForm({
          params: {eventId: eventDetail.id, authToken: authToken || undefined},
          clientMode: CLIENT_MODE,
        })
      : Promise.resolve(null),
  ])

  const availableHost: Array<Profile | Group> = currProfile
    ? eventDetail.owner.id === currProfile?.id
      ? [currProfile, ...availableGroupHost]
      : [eventDetail.owner, ...availableGroupHost]
    : []

  return {
    currProfile,
    eventDraft: {
      ...toEventDraft(eventDetail),
      form,
      // Seeded from the group's pointer — the single source of truth — so the
      // toggle reflects reality on an already-designated event.
      is_group_ticket_event: groupDetail.group_ticket_event_id === eventDetail.id,
    },
    recurring,
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
