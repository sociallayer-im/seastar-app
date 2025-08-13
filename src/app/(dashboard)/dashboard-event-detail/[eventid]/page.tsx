import EventDetailPage, {
    EventDetailPageDataProps,
    EventDetailPageSearchParams
} from "@/app/(normal)/event/detail/[eventid]/data"
import {
    displayProfileName,
    eventCoverTimeStr,
    genGoogleMapLinkByEvent,
    getAvatar,
    getEventDetailPageTimeStr, pickSearchParam, prefixUrl
} from "@/utils"
import { selectLang } from "@/app/actions"
import { Button, buttonVariants } from "@/components/shadcn/Button"
import RichTextDisplayer from "@/components/client/Editor/Displayer"
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
import Dynamic from 'next/dynamic'
import CommentPanel from '@/components/client/CommentPanel'
import Image from 'next/image'
import { cache } from 'react'
import EventParticipantTab from '@/app/(normal)/event/detail/[eventid]/EventParticipantTab'
import VenueDetailBtn from '@/components/client/VenueDetailBtn'
import { getLabelColor } from '@/utils/label_color'

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
            url: `https://app.sola.day/event/detail/${eventDetail.id}`,
            images: eventDetail.cover_url || '/images/facaster_default_cover.png',
        }
    }
}

export default async function EventDetail({ params: { eventid }, searchParams: { tab: _tab } }: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams
}) {
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
        enableGoogleMap
    } = await cachedEventDetailPage(eventid, pickSearchParam(_tab))
    const { lang } = await selectLang()

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
            location: eventDetail.venue.title,
            formatted_address: eventDetail.venue.formatted_address,
            geo_lat: eventDetail.venue.geo_lat,
            geo_lng: eventDetail.venue.geo_lng
        }
    } else if (!!eventDetail.location) {
        locationInfo = {
            location: eventDetail.location,
            formatted_address: eventDetail.formatted_address,
            geo_lat: eventDetail.geo_lat,
            geo_lng: eventDetail.geo_lng
        }
    }

    return <div className="page-width !pt-4 !pb-12">
        <div className="flex flex-col sm:flex-row">
            <div className="min-w-[324px] sm:max-w-[324px] mb-8 order-1 sm:order-2 sm:mb-0">
                {
                    !!eventDetail.cover_url
                        ? <img className="max-w-[450px] w-full mx-auto"
                            src={eventDetail.cover_url} alt="" />
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
                                    {eventDetail.location}
                                </div>
                            </div>
                        </div>
                }
            </div>

            <div className="flex-1 sm:mr-9 order-2 sm:order-1">
                <div className="text-4xl font-semibold w-full">
                    {eventDetail.title}
                </div>

                {eventDetail.track && <div className="flex-row-item-center gap-1.5 text-lg mt-1"
                    style={{ color: getLabelColor(eventDetail.track.title) }}>
                    {eventDetail.track.title}
                </div>}


                <div className="flex-row-item-center my-3 gap-3 overflow-auto !flex-wrap">
                    {eventProcess === 'past' && <Badge variant='past' className="mr-1">{lang['Past']}</Badge>}
                    {eventDetail.display === 'private' &&
                        <Badge variant='private' className="mr-1">{lang['Private']}</Badge>}
                    {eventDetail.status === 'pending' &&
                        <Badge variant='pending' className="mr-1">{lang['Pending']}</Badge>}
                    {eventDetail.status === 'cancel' &&
                        <Badge variant='cancel' className="mr-1">{lang['Canceled']}</Badge>}
                    {isEventClosed && <Badge variant='cancel' className="mr-1">Closed</Badge>}

                    {eventProcess === 'ongoing' && <Badge variant='ongoing' className="mr-1">{lang['Ongoing']}</Badge>}
                    {eventProcess === 'upcoming' &&
                        <Badge variant='upcoming' className="mr-1">{lang['Upcoming']}</Badge>}


                    {isEventCreator && <Badge variant='hosting' className="mr-1">{lang['Hosting']}</Badge>}
                    {currProfileAttended && <Badge variant='joining' className="mr-1">{lang['Attended']}</Badge>}


                    {
                        eventDetail.tags?.map(tag => {
                            const color = getLabelColor(tag)

                            return <div className="flex-row-item-center gap-1.5 text-sm">
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
                                href={customHost.item_id ? `/profile/${customHost.profile!.handle}` : '#'}>
                                <img className="w-11 h-11 rounded-full mr-2"
                                    src={getAvatar(customHost.item_id, customHost.image_url)} alt="" />
                                <div>
                                    <div className="font-semibold text-sm text-nowrap">
                                        {customHost.nickname}
                                    </div>
                                    <div className="text-xs text-gray-400">{lang['Host']}</div>
                                </div>
                            </a> : !!groupHost ?
                                (groupHost.group ? <a
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={groupHost.group ? `/group/${groupHost.group!.handle}` : undefined}>
                                    <Avatar profile={groupHost.group!} size={44} className="mr-2" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {groupHost.nickname}
                                        </div>
                                        <div className="text-xs text-gray-400">{lang['Host']}</div>
                                    </div>
                                </a> : null)
                                : <a className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={`/profile/${owner.handle}`}>
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
                                    href={role.item_id ? `/profile/${role.profile!.handle}` : '#'}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                        src={getAvatar(role.item_id, role.image_url)} alt="" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {role.nickname}
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
                                    href={role.item_id ? `/profile/${role.profile!.handle}` : undefined}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                        src={getAvatar(role.item_id, role.image_url)} alt="" />
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {role.nickname}
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
                                   href={genGoogleMapLinkByEvent(eventDetail)}>{lang['View map']}</a>

                                {!!locationInfo.formatted_address &&
                                    <ClickToCopy text={locationInfo.formatted_address}
                                        className={'text-xs text-blue-400 cursor-pointer mr-3'}>
                                        {lang['Copy Address']}
                                    </ClickToCopy>
                                }

                                {!!eventDetail.venue_id &&
                                    <VenueDetailBtn
                                        lang={lang}
                                        groupHandle={groupDetail.handle}
                                        venueId={eventDetail.venue_id}
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

                    {!!eventDetail.badge_class &&
                        <a className={`${buttonVariants({ variant: 'secondary' })} mt-2 w-full !h-auto`}
                            href={`/badge-class/${eventDetail.badge_class.id}`}>
                            <div className="flex flex-row justify-between w-full items-center text-sm">
                                <div className="flex-1 whitespace-pre-line">
                                    {lang['Registration for the event, upon completion, will be rewarded with POAP*1']}
                                </div>
                                <Image className="min-w-9 min-h-9 rounded-full"
                                    src={eventDetail.badge_class.image_url!} width={36} height={36} alt="" />
                            </div>
                        </a>}
                </div>

                <div className="grid sm:flex grid-cols-2 font-semibold mt-6">
                    <a href={'?tab=content'}
                        className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 relative">
                        <span className="z-10">{lang['Content']}</span>
                        {(tab === 'content' || tab === '') &&
                            <img width={90} height={12}
                                 className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                 src="/images/tab_bg.png" alt="" />
                        }
                    </a>
                    {isTicketEvent && <a href={'?tab=tickets'}
                        className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2  mr-0 relative border-l-[1px] border-gray-200">
                        <div className="z-10">
                            {lang['Tickets']}
                            <span className="text-xs">({eventDetail.tickets?.length})</span>
                        </div>
                        {tab === 'tickets' &&
                            <img width={90} height={12}
                                 className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                 src="/images/tab_bg.png" alt="" />
                        }
                    </a>
                    }

                    {showParticipants && <a href={'?tab=participants'}
                        className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">
                        <div className="z-10">
                            {lang['Participants']}
                        </div>
                        {tab === 'participants' &&
                            <img width={90} height={12}
                                 className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                 src="/images/tab_bg.png" alt="" />
                        }
                    </a>
                    }
                </div>

                {!tab || tab === "content" &&
                    <div>
                        {!!seatingStyle?.length && isEventOperator && isEventOperator &&
                            <div className="my-3 text-sm bg-gray-100 p-3 rounded-lg">
                                <div className="font-semibold">
                                    {lang['Seating Arrangement Style']}
                                </div>
                                <div>{seatingStyle.join(', ')}</div>
                            </div>
                        }
                        {!!avNeeds?.length && isEventOperator && isEventOperator &&
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

                        {!!eventDetail.notes ?
                            currProfileAttended ?
                                <div className="bg-secondary border-dashed border-2 rounded-lg p-3 mt-8 ">
                                    <div className="font-semibold mb-2">{lang['Event Note']}</div>
                                    <div className="editor-wrapper display">
                                        <RichTextDisplayer markdownStr={eventDetail.notes || ''} />
                                    </div>
                                </div>
                                : <div className="bg-secondary border-dashed border-2 rounded-lg p-3 mt-8 ">
                                    <div className="font-semibold mb-2">{lang['Attend event to view notes']}</div>
                                    <div className="bg-gray-300 w-full h-4 rounded-lg mb-2" />
                                    <div className="bg-gray-300 w-80 h-4 rounded-lg" />
                                </div>
                            : null
                        }

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
                }

                {tab === 'participants' &&
                    <EventParticipantTab
                        lang={lang}
                        eventDetail={eventDetail}
                        currProfile={currProfile}
                        isEventOperator={isEventOperator}
                    />
                }

                {tab === 'tickets' &&
                    <TicketList
                        eventDetail={eventDetail}
                        lang={lang}
                        currProfile={currProfile} />
                }



            </div>
        </div>
    </div>
}
