import {CANONICAL_ORIGIN} from '@/app/config'
import EventDetailPage, {
    EventDetailPageDataProps,
    EventDetailPageSearchParams
} from "@/app/(normal)/event/detail/[eventid]/data"
import {
    cfImage,
    displayProfileName,
    eventCoverTimeStr,
    genGoogleMapLink,
    getAvatar,
    getEventDetailPageTimeStr, normalizeGroupPermission, pickSearchParam, prefixUrl
} from "@/utils"
import { selectLang } from "@/app/actions"
import { Button, buttonVariants } from "@/components/shadcn/Button"
import RichTextDisplayer from "@/components/client/Editor/Displayer"
import Img from "@/components/Img"
import Avatar from '@/components/Avatar'
import AddSingleEventToCalendarApp from '@/components/client/AddSingleEventToCalendarAppBtn'
import EventFeedbackBtn from '@/components/EventFeedbackBtn'
import AttendEventBtn from '@/components/client/AttendEventBtn'
import { Badge } from '@/components/shadcn/Badge'
import SignInPanel from '@/components/SignInPanel'
import RecurringListBtn from '@/app/(normal)/event/detail/[eventid]/RecurringListBtn'
import GoogleMap from '@/components/client/Map'
import ClickToCopy from '@/components/client/ClickToCopy'
import removeMarkdown from 'markdown-to-text'
import TicketList from '@/app/(normal)/event/detail/[eventid]/TicketList'
import MyTicketList from '@/app/(normal)/event/detail/[eventid]/MyTicketList'
import PaymentReturn from '@/app/(normal)/event/detail/[eventid]/PaymentReturn'
import JoinTicketEventBtn from '@/app/(normal)/event/detail/[eventid]/JoinTicketEventBtn'
import Dynamic from 'next/dynamic'
import CommentPanel from '@/components/client/CommentPanel'
import { cache } from 'react'
import EventParticipantTab from '@/app/(normal)/event/detail/[eventid]/EventParticipantTab'
import EventTabs from '@/app/(normal)/event/detail/[eventid]/EventTabs'
import VenueDetailBtn from '@/components/client/VenueDetailBtn'
import { getLabelColor } from '@/utils/label_color'
import EventKindLabel from "@/components/EventKind"
import GoToBuyTicket from '@/components/client/GoToBuyTicket'
import CancelRegistrationBtn from '@/components/client/CancelRegistrationBtn'
import MyApplicationBtn from '@/components/client/MyApplicationBtn'

const DynamicEventCardStarBtn = Dynamic(() => import('@/components/client/StarEventBtn'), { ssr: false })

const cachedEventDetailPage = cache(EventDetailPage)

export async function generateMetadata({ params: { eventid }, searchParams: { tab } }: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams
}) {
    const { eventDetail } = await cachedEventDetailPage(eventid, pickSearchParam(tab))

    const description = removeMarkdown(eventDetail.content || '').slice(0, 200)
    return {
        title: `${eventDetail.title} | ${process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer"}`,
        openGraph: {
            title: `${eventDetail.title} | ${process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer"}`,
            description: description,
            type: 'website',
            url: `${CANONICAL_ORIGIN}/event/detail/${eventDetail.id}`,
            images: eventDetail.image_url || '/images/facaster_default_cover.png',
        }
    }
}

export default async function EventDetail({ params: { eventid }, searchParams: { tab: _tab, payment } }: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams & { payment?: string | string[] }
}) {
    const paymentReturn = pickSearchParam(payment)
    const {
        eventDetail,
        groupDetail,
        currProfile,
        groupHost,
        customHost,
        owner,
        tab,
        isEventCreator,
        isEventOperator,
        canAccess,
        currProfileAttended,
        currProfilePending,
        currProfilePaymentPending,
        currProfileParticipant,
        pendingTicketItemId,
        currProfileCheckedIn,
        isTicketEvent,
        eventProcess,
        isEventClosed,
        showParticipants,
        avNeeds,
        externalCatering,
        seatingStyle,
        recurring,
        ticketsPurchased,
        currProfileStarred,
        enableGoogleMap,
        canPublishEvent,
        canViewAllSubmissions,
        form
    } = await cachedEventDetailPage(eventid, pickSearchParam(_tab))
    const { lang } = await selectLang()

    // Geo/address now live on the event's place (soon PlaceBlueprint).
    let locationInfo: {
        location: string | null
        formatted_address: string | null
        geo_lat: number | null
        geo_lng: number | null
    } = {
        location: '',
        formatted_address: null,
        geo_lat: null,
        geo_lng: null,
    }

    if (!!eventDetail.venue) {
        locationInfo = {
            location: eventDetail.venue.name,
            formatted_address: eventDetail.place?.address || null,
            geo_lat: eventDetail.place?.latitude || null,
            geo_lng: eventDetail.place?.longitude || null
        }
    } else if (!!eventDetail.place) {
        locationInfo = {
            location: eventDetail.place.name,
            formatted_address: eventDetail.place.address,
            geo_lat: eventDetail.place.latitude,
            geo_lng: eventDetail.place.longitude
        }
    }

    return <div className="page-width !pt-4 !pb-12">
        <div className="flex flex-row items-center justify-between sm:mb-8 mb-4">
            <a href={`/event/${groupDetail.name}`} className="flex-row-item-center">
                <Avatar size={24} profile={groupDetail} className="mr-1" />
                <span
                    className="font-semibold font-sm overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[120px] sm:max-w-max">
                    {displayProfileName(groupDetail)}
                </span>
            </a>

            <div className="flex-row-item-center">
                {!!eventDetail.tickets?.length && isEventOperator &&
                    <a href={`/event/detail/${eventDetail.id}/promo-code`}
                        className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-2 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                        <i className="uil-ticket text-lg" />
                        <span className="sm:inline hidden ml-1 ">{lang['Promo Code']}</span>
                    </a>
                }
                {isEventOperator &&
                    <a href={`/event/edit/${eventDetail.id}`}
                        className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-2 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                        <i className="uil-edit-alt" />
                        <span className="sm:inline hidden ml-1 ">{lang['Edit']}</span>
                    </a>}
                <DynamicEventCardStarBtn
                    label={lang['Star']}
                    eventId={eventDetail.id}
                    starred={currProfileStarred}
                    kind={'normal'} />
                <a href={`/event/share/${eventDetail.id}`}
                    className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-2 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                    <i className="uil-external-link-alt " />
                    <span className="sm:inline hidden ml-1 ">{lang['Share']}</span>
                </a>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row">
            <div className="min-w-[324px] sm:max-w-[324px] mb-8 order-1 sm:order-2 sm:mb-0">
                {
                    !!eventDetail.image_url
                        ? <img className="max-w-[450px] w-full mx-auto"
                            src={cfImage(eventDetail.image_url, { width: 900, format: 'auto', quality: 85 })} alt="" />
                        :
                        <div className="w-[324px] h-[324px] overflow-hidden mx-auto">
                            <div className="default-cover w-[452px] h-[452px]" style={{ transform: 'scale(0.716814)' }}>
                                <div
                                    className="font-semibold text-[27px] webkit-box-clamp-2 max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                                    {eventDetail.title}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[178px]">
                                    {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).date}
                                    <br />
                                    {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).time}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[240px]">
                                    {eventDetail.place?.name}
                                </div>
                            </div>
                        </div>
                }

                {currProfile ?
                    <div className="border-gray-200 border rounded-lg p-4 mt-6">
                        <div className="flex-row-item-center text-sm">
                            <Avatar profile={currProfile!} size={24} className="mr-1" />
                            <span>{displayProfileName(currProfile!)}</span>
                        </div>

                        {currProfileAttended &&
                            <div className="my-2">{lang['You have registered for the event.']}</div>}
                        {/* The API only includes image_note for the organizer
                            and settled attendees, so presence == permission —
                            no client-side gating to get wrong. */}
                        {currProfileAttended && !!eventDetail.image_note &&
                            <div className="my-2">
                                <div className="text-xs text-gray-500 mb-1">{lang['Event Note']}</div>
                                <Img src={eventDetail.image_note} width={480} height={480}
                                    alt="" className="w-full max-w-[240px] h-auto rounded-lg" />
                            </div>}
                        {currProfilePending &&
                            <div className="my-2">{lang['Your registration is under review.']}</div>}
                        {!currProfileAttended && !currProfilePending && canAccess &&
                            <div className="my-2">{lang['Welcome! To join the event, please register below.']}</div>}
                        {/* canAccess is false for two unrelated reasons — the
                            group's join scope, or the event being closed or
                            cancelled. Saying "only for managers" about a closed
                            event that anyone could have joined is just wrong. */}
                        {!canAccess && (normalizeGroupPermission(groupDetail.can_join_event) === 'everyone'
                            ? <div className="my-2">{lang['Closed']}</div>
                            : <div className="my-2">{lang['This event is only for {}']
                                .replace('{}', normalizeGroupPermission(groupDetail.can_join_event) === 'member'
                                    ? lang['members'] : lang['managers'])}</div>)}

                        <div className="flex-row-item-center">
                            <AddSingleEventToCalendarApp
                                event={eventDetail}
                                lang={lang}
                                className="text-xs flex-1" />
                            <EventFeedbackBtn eventId={eventDetail.id}
                                lang={lang}
                                className="text-xs flex-1 ml-2" />
                        </div>

                        {!isTicketEvent && !currProfileAttended && !currProfilePending && canAccess &&
                            <div className="flex-row-item-center mt-2">
                                <AttendEventBtn eventId={eventDetail.id} lang={lang}
                                    form={form}
                                    requireApproval={!!eventDetail.require_approval}
                                    className="text-xs flex-1" />
                            </div>
                        }

                        {/* Applied, not decided: the button's job is to say so,
                            not to offer a second application — but the
                            applicant must be able to back out, or "under
                            review" is a state they can never leave. */}
                        {currProfilePending &&
                            <div className="flex-row-item-center mt-2 gap-2">
                                <Button disabled={true} variant={'secondary'} className="text-xs flex-1">
                                    {lang['Under Review']}
                                </Button>
                                {!!currProfileParticipant &&
                                    <CancelRegistrationBtn
                                        lang={lang}
                                        kind="application"
                                        eventId={eventDetail.id}
                                        participantId={currProfileParticipant.id}
                                        className="text-xs flex-1"/>
                                }
                            </div>
                        }

                        {/* Reaching your own answers used to mean finding
                            yourself in the participants tab — which a ticketed
                            event hides from everyone but the organizer, so on
                            exactly the events people pay to apply to there was
                            no way in at all. Editable while under review;
                            read-only once the organizer has decided on them. */}
                        {!!form && !!currProfileParticipant &&
                            (currProfilePending || currProfileAttended) &&
                            <div className="flex-row-item-center mt-2">
                                <MyApplicationBtn
                                    eventId={eventDetail.id}
                                    lang={lang}
                                    editable={currProfilePending}
                                    className="text-xs flex-1"/>
                            </div>
                        }

                        {isTicketEvent && !currProfileAttended && !currProfilePending && canAccess && !currProfilePaymentPending &&
                            <div className="flex-row-item-center mt-2">
                                <JoinTicketEventBtn
                                    eventDetail={eventDetail}
                                    lang={lang}
                                    currProfile={currProfile}
                                    className="text-xs flex-1" />
                            </div>
                        }

                        {/* An order is already in flight — finishing it is the
                            action, not starting another. Abandoning it is the
                            other legitimate action: without it the buyer is
                            stuck here until the sweeper expires the order,
                            because the API refuses a second one for the same
                            ticket. */}
                        {isTicketEvent && !currProfileAttended && currProfilePaymentPending &&
                            <div className="mt-2">
                                <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                    {lang['Order awaiting payment']}
                                </div>
                                {!!pendingTicketItemId &&
                                    <div className="flex-row-item-center mt-2">
                                        <CancelRegistrationBtn
                                            lang={lang}
                                            kind="order"
                                            eventId={eventDetail.id}
                                            ticketItemId={pendingTicketItemId}
                                            className="text-xs flex-1"/>
                                    </div>
                                }
                            </div>
                        }

                        {isEventOperator &&
                            <div className="flex-row-item-center mt-2">
                                <a className={`${buttonVariants({ variant: 'secondary' })} text-xs flex-1`}
                                    href={`/event/checkin-for-participants/${eventDetail.id}`}>
                                    <span>{lang['Check-In For Participants']}</span>
                                </a>
                            </div>
                        }

                        {!currProfileCheckedIn && currProfileAttended && !isEventOperator &&
                            <div className="flex-row-item-center mt-2">
                                <a className={`${buttonVariants({ variant: 'primary' })} text-xs flex-1`}
                                    href={`/event/checkin/${eventDetail.id}`}>
                                    <span>{lang['Check-In']}</span>
                                </a>
                            </div>
                        }

                        {currProfileCheckedIn &&
                            <div className="flex-row-item-center mt-2">
                                <Button disabled={true} variant={'secondary'}
                                    className="text-xs flex-1">
                                    {lang['Checked']}
                                </Button>
                            </div>
                        }

                        {(paymentReturn === 'success' || paymentReturn === 'cancelled') && !!currProfile &&
                            <div className="mt-3">
                                <PaymentReturn
                                    lang={lang}
                                    eventId={eventDetail.id}
                                    profileName={currProfile.name}
                                    result={paymentReturn}/>
                            </div>
                        }

                        {!!ticketsPurchased.length &&
                            <div className="mt-3">
                                <MyTicketList tickets={ticketsPurchased} lang={lang} />
                            </div>
                        }

                        {canPublishEvent &&
                            <div className="flex-row-item-center mt-2">
                                <a href={`/event/${groupDetail.name}/create`}
                                    className={`${buttonVariants({ variant: 'secondary' })} text-xs flex-1`}>
                                    <i className="uil-plus mr-1" />
                                    <span>{lang['Create Event']}</span>
                                </a>
                            </div>
                        }
                    </div>
                    : <SignInPanel lang={lang} />
                }
            </div>

            <div className="flex-1 sm:mr-9 order-2 sm:order-1">
                <div className="text-4xl font-semibold w-full">
                    <EventKindLabel kind={eventDetail.kind} />{eventDetail.title}
                </div>

                {eventDetail.track && <div className="flex-row-item-center gap-1.5 text-lg mt-1"
                    style={{ color: getLabelColor(eventDetail.track.title) }}>
                    {eventDetail.track.title}
                </div>}


                <div className="flex-row-item-center my-3 gap-3 overflow-auto !flex-wrap">
                    {/* This event's tickets grant group membership. Derived from
                        the group's pointer, the single source of truth. */}
                    {groupDetail.group_ticket_event_id === eventDetail.id &&
                        <Badge variant='hosting' className="mr-1"
                            title={lang['Group ticket event intro']}>
                            {lang['Group ticket event']}
                        </Badge>}
                    {eventProcess === 'past' && <Badge variant='past' className="mr-1">{lang['Past']}</Badge>}
                    {eventDetail.visibility === 'private' &&
                        <Badge variant='private' className="mr-1">{lang['Private']}</Badge>}
                    {eventDetail.status === 'pending' &&
                        <Badge variant='pending' className="mr-1">{lang['Pending']}</Badge>}
                    {eventDetail.status === 'cancelled' &&
                        <Badge variant='cancel' className="mr-1">{lang['Cancelled']}</Badge>}
                    {isEventClosed && <Badge variant='cancel' className="mr-1">Closed</Badge>}

                    {eventProcess === 'ongoing' && <Badge variant='ongoing' className="mr-1">{lang['Ongoing']}</Badge>}
                    {eventProcess === 'upcoming' &&
                        <Badge variant='upcoming' className="mr-1">{lang['Upcoming']}</Badge>}


                    {isEventCreator && <Badge variant='hosting' className="mr-1">{lang['Hosting']}</Badge>}
                    {currProfileAttended && <Badge variant='joining' className="mr-1">{lang['Attended']}</Badge>}
                    {currProfilePending && <Badge variant='pending' className="mr-1">{lang['Under Review']}</Badge>}


                    {
                        eventDetail.tags?.map(tag => {
                            const color = getLabelColor(tag)

                            return <div key={tag} className="flex-row-item-center gap-1.5 text-sm">
                                <i className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <div>{tag}</div>
                            </div>
                        })
                    }
                </div>


                <div className="my-4 border-t-[1px] border-b-[1px] border-gray-300">
                    <div className="hide-scroll whitespace-nowrap overflow-auto max-w-[640px]">
                        {!!customHost ?
                            <a key={customHost.id}
                                className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                href={customHost.item_id ? `/profile/${customHost.item_id}` : '#'}>
                                <img className="w-11 h-11 rounded-full mr-2"
                                    src={cfImage(getAvatar(customHost.item_id, customHost.image_url), { width: 48, height: 48, fit: 'cover' })} alt="" />
                                <div>
                                    <div className="font-semibold text-sm text-nowrap">
                                        {customHost.display_name}
                                    </div>
                                    <div className="text-xs text-gray-400">{lang['Host']}</div>
                                </div>
                            </a> : !!groupHost ?
                                <a
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={groupHost.item_id ? `/group/${groupHost.item_id}` : undefined}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                        src={cfImage(getAvatar(groupHost.item_id, groupHost.image_url), { width: 48, height: 48, fit: 'cover' })} alt="" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {groupHost.display_name}
                                        </div>
                                        <div className="text-xs text-gray-400">{lang['Host']}</div>
                                    </div>
                                </a>
                                : <a className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={`/profile/${owner.name}`}>
                                    <Avatar profile={owner} size={44} className="mr-2" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {displayProfileName(owner)}
                                        </div>
                                        <div className="text-xs text-gray-400">{lang['Host']}</div>
                                    </div>
                                </a>
                        }

                        {
                            eventDetail.event_roles?.filter(role => role.role === 'co_host').map(role => {
                                return <a key={role.id}
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={role.item_id ? `/profile/${role.item_id}` : '#'}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                        src={cfImage(getAvatar(role.item_id, role.image_url), { width: 48, height: 48, fit: 'cover' })} alt="" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {role.display_name}
                                        </div>
                                        <div className="text-xs text-gray-400">{lang['Co-Host']}</div>
                                    </div>
                                </a>
                            })
                        }
                    </div>

                    <div className="hide-scroll whitespace-nowrap overflow-auto max-w-[640px]">
                        {
                            eventDetail.event_roles?.filter(role => role.role === 'speaker').map(role => {
                                return <a key={role.id}
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={role.item_id ? `/profile/${role.item_id}` : undefined}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                        src={cfImage(getAvatar(role.item_id, role.image_url), { width: 48, height: 48, fit: 'cover' })} alt="" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {role.display_name}
                                        </div>
                                        <div className="text-xs text-gray-400">{lang['Speaker']}</div>
                                    </div>
                                </a>
                            })
                        }
                    </div>
                </div>

                <div>
                    <div className="flex-row-item-center my-4">
                        <div
                            className="mr-2 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                            <i className="uil-calendar-alt text-base"></i>
                        </div>
                        <div>
                            <div className="font-semibold text-base">{getEventDetailPageTimeStr(eventDetail).date}</div>
                            <div className="text-gray-400 text-base">{getEventDetailPageTimeStr(eventDetail).time}</div>
                            {!!recurring &&
                                <RecurringListBtn lang={lang} recurring={recurring} currEventId={eventDetail.id} />
                            }
                        </div>
                    </div>
                    {!!locationInfo.location &&
                        <>
                            <div className="flex-row-item-center my-4">
                                <div
                                    className="mr-2 flex-shrink-0 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                                    <i className="uil-location-point text-base"></i>
                                </div>
                                <div>
                                    <div className="font-semibold text-base">{locationInfo.location}</div>
                                    {locationInfo.formatted_address &&
                                        <div className="text-gray-400 text-base">
                                            {locationInfo.formatted_address}
                                        </div>
                                    }
                                </div>
                            </div>
                        </>
                    }
                    {!!locationInfo.geo_lat && !!locationInfo.geo_lng &&
                        <div className="ml-11 -mt-4">
                            <div className="flex-row-item-center mb-2">
                                <a className="text-xs text-blue-400 cursor-pointer mr-3"
                                    target={'_blank'}
                                    href={genGoogleMapLink(locationInfo.geo_lat!, locationInfo.geo_lng!, eventDetail.place?.data?.place_id)}>{lang['View map']}</a>

                                {!!locationInfo.formatted_address &&
                                    <ClickToCopy text={locationInfo.formatted_address}
                                        className={'text-xs text-blue-400 cursor-pointer mr-3'}>
                                        {lang['Copy Address']}
                                    </ClickToCopy>
                                }

                                {!!eventDetail.venue &&
                                    <VenueDetailBtn
                                        lang={lang}
                                        groupHandle={groupDetail.name}
                                        venueId={eventDetail.venue.id}
                                        className="text-xs text-blue-400 cursor-pointer mr-3"
                                        label={lang['Venue Detail']} />
                                }
                            </div>
                            {enableGoogleMap &&
                                <GoogleMap
                                    style={{ height: '160px', width: '100%' }}
                                    center={{
                                        lng: locationInfo.geo_lng,
                                        lat: locationInfo.geo_lat
                                    }}
                                    markers={[{
                                        title: eventDetail.title,
                                        position: {
                                            lng: locationInfo.geo_lng,
                                            lat: locationInfo.geo_lat
                                        }
                                    }]} />
                            }
                        </div>
                    }

                    {!!eventDetail.meeting_url &&
                        <div className="flex-row-item-center my-4">
                            <div
                                className="mr-2 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                                <i className="uil-link text-base"></i>
                            </div>
                            <div>
                                <div className="font-semibold text-base">{lang['Online Meeting']}</div>
                                <a href={prefixUrl(eventDetail.meeting_url)} target={'_blank'}
                                    className="text-gray-400 text-base hover:text-blue-400">
                                    {eventDetail.meeting_url}
                                </a>
                            </div>
                        </div>
                    }

                </div>

                {/* The panels are built here, on the server, and switched in the
                    browser — see EventTabs. `data.ts` never branched on `tab`,
                    so all three panels' data is fetched for every request
                    anyway; navigating between them was re-fetching it. */}
                <EventTabs
                    initialTab={tab}
                    tabs={[
                        {
                            key: 'content',
                            label: lang['Content'],
                            panel: <div>
                                {!!seatingStyle?.length && isEventOperator &&
                                    <div className="my-3 text-sm bg-gray-100 p-3 rounded-lg">
                                        <div className="font-semibold">
                                            {lang['Seating Arrangement Style']}
                                        </div>
                                        <div>{seatingStyle.join(', ')}</div>
                                    </div>
                                }
                                {!!avNeeds?.length && isEventOperator &&
                                    <div className="my-3 text-sm bg-gray-100 p-3 rounded-lg">
                                        <div className="font-semibold">
                                            {lang['AV Needed']}
                                        </div>
                                        <div>{avNeeds.join(', ')}</div>
                                    </div>
                                }

                                {!!externalCatering?.length && isEventOperator &&
                                    <div className="my-3 text-sm bg-gray-100 p-3 rounded-lg">
                                        <div className="font-semibold">
                                            External Catering
                                        </div>
                                        <div>{externalCatering.join(', ')}</div>
                                    </div>
                                }

                                <div className="editor-wrapper display my-3">
                                    <RichTextDisplayer markdownStr={eventDetail.content || ''} />
                                </div>

                                <div>
                                    <div className="font-semibold">{lang['Comments']}</div>
                                    <div className="py-4">
                                        <CommentPanel lang={lang}
                                            currProfile={currProfile}
                                            itemType={'Event'}
                                            commentType={'comment'}
                                            itemId={eventDetail.id} />
                                    </div>
                                </div>
                            </div>
                        },
                        ...(isTicketEvent ? [{
                            key: 'tickets' as const,
                            label: lang['Tickets'],
                            count: eventDetail.tickets?.length,
                            panel: <TicketList
                                eventDetail={eventDetail}
                                lang={lang}
                                currProfile={currProfile}
                                attended={currProfileAttended || currProfilePending}
                                paymentPending={currProfilePaymentPending} />
                        }] : []),
                        ...(showParticipants ? [{
                            key: 'participants' as const,
                            label: lang['Participants'],
                            // The backend's own counter, because the attendee
                            // array is no longer downloaded to be counted.
                            count: eventDetail.participant_count || undefined,
                            panel: <EventParticipantTab
                                lang={lang}
                                eventDetail={eventDetail}
                                currProfile={currProfile}
                                isEventOperator={isEventOperator}
                                canViewAllSubmissions={canViewAllSubmissions}
                            />
                        }] : [])
                    ]}
                />
            </div>
        </div>
    </div>
}
