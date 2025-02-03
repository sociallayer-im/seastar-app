import EventDetailPage, {
    EventDetailPageDataProps,
    EventDetailPageSearchParams
} from "@/app/(normal)/event/detail/[eventid]/data"
import {
    displayProfileName,
    displayTicketPrice,
    eventCoverTimeStr,
    genGoogleMapLinkByEvent,
    getAvatar,
    getEventDetailPageTimeStr, shortWalletAddress
} from "@/utils"
import {selectLang} from "@/app/actions"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {getChainIconById} from "@/utils/payment_setting"
import RichTextDisplayer from "@/components/client/Editor/Displayer"
import NoData from "@/components/NoData"
import {Textarea} from "@/components/shadcn/Textarea"
import Avatar from '@/components/Avatar'
import AddSingleEventToCalendarApp from '@/components/client/AddSingleEventToCalendarAppBtn'
import EventFeedbackBtn from '@/components/EventFeedbackBtn'
import AttendEventBtn from '@/components/client/AttendEventBtn'
import {Badge} from '@/components/shadcn/Badge'
import SignInPanel from '@/components/SignInPanel'
import EventParticipantList from '@/components/client/EventParticipantList'

export async function generateMetadata({params, searchParams}: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams
}) {
    const {eventDetail} = await EventDetailPage({params, searchParams})

    return {
        title: `${eventDetail.title} | Social Layer`
    }
}

export default async function EventDetail({params, searchParams}: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams
}) {
    const {
        eventDetail,
        groupDetail,
        currProfile,
        groupHost,
        owner,
        tab,
        isEventCreator,
        isGroupManager,
        isEventOperator,
        canAccess,
        currProfileAttended,
        currProfileCheckedIn,
        isTicketEvent,
        eventProcess,
        isEventClosed,
        showParticipants,
        avNeeds,
        seatingStyle
    } = await EventDetailPage({
        params,
        searchParams
    })
    const {lang} = await selectLang()

    return <div className="page-width !pt-4 !pb-12">
        <div className="flex flex-row items-center justify-between sm:mb-8 mb-4">
            <a href={`/event/${groupDetail.handle}`} className="flex-row-item-center">
                <Avatar size={24} profile={groupDetail} className="mr-1"/>
                <span
                    className="font-semibold font-sm overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[120px] sm:max-w-max">
                    {displayProfileName(groupDetail)}
                </span>
            </a>

            <div className="flex-row-item-center">
                {isEventOperator &&
                    <a href={`/event/edit/${eventDetail.id}`}
                       className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-4 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                        <i className="uil-edit-alt mr-1"></i>
                        <span>{lang['Edit']}</span>
                    </a>}
                <a href={`/event/share/${eventDetail.id}`}
                   className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-4 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                    <i className="uil-external-link-alt mr-1"></i>
                    <span>{lang['Share']}</span>
                </a>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row">
            <div className="min-w-[324px] sm:max-w-[324px] mb-8 order-1 sm:order-2 sm:mb-0">
                {
                    !!eventDetail.cover_url
                        ? <img className="max-w-[450px] w-full mx-auto"
                               src={eventDetail.cover_url} alt=""/>
                        :
                        <div className="w-[324px] h-[324px] overflow-hidden mx-auto">
                            <div className="default-cover w-[452px] h-[452px]" style={{transform: 'scale(0.716814)'}}>
                                <div
                                    className="font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                                    {eventDetail.title}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[178px]">
                                    {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).date}
                                    <br/>
                                    {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).time}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[240px]">
                                    {eventDetail.location}
                                </div>
                            </div>
                        </div>
                }


                {canAccess &&
                    <>
                        {currProfile ?
                            <div className="border-gray-200 border rounded-lg p-4 mt-6">
                                <div className="flex-row-item-center text-xs">
                                    <Avatar profile={currProfile!} size={24} className="mr-1"/>
                                    <span>{displayProfileName(currProfile!)}</span>
                                </div>

                                {currProfileAttended
                                    ? <div className="my-2">{lang['You have registered for the event.']}</div>
                                    :
                                    <div
                                        className="my-2">{lang['Welcome! To join the event, please register below.']}</div>
                                }

                                <div className="flex-row-item-center">
                                    <AddSingleEventToCalendarApp
                                        event={eventDetail}
                                        lang={lang}
                                        className="text-xs flex-1"/>
                                    <EventFeedbackBtn eventId={eventDetail.id}
                                                      lang={lang}
                                                      className="text-xs flex-1 ml-2"/>
                                </div>

                                {!isTicketEvent && !currProfileAttended &&
                                    <div className="flex-row-item-center mt-2">
                                        <AttendEventBtn eventId={eventDetail.id} lang={lang}
                                                        className="text-xs flex-1"/>
                                    </div>
                                }

                                {isEventOperator ?
                                    eventDetail.badge_class_id
                                        ? <div className="flex-row-item-center mt-2">
                                            <a className={`${buttonVariants({variant: 'secondary'})} text-xs flex-1`}
                                               href={`/event/checkin-for-participants/${eventDetail.id}`}>
                                                <span>{lang['Check-In And Send POAP']}</span>
                                            </a>
                                        </div>
                                        : <div className="flex-row-item-center mt-2">
                                            <a className={`${buttonVariants({variant: 'secondary'})} text-xs flex-1`}
                                               href={`/event/checkin-for-participants/${eventDetail.id}`}>
                                                <span>{lang['Check-In For Participants']}</span>
                                            </a>
                                        </div>
                                    : !currProfileAttended
                                        ? <div className="flex-row-item-center mt-2">
                                            <a className={`${buttonVariants({variant: 'primary'})} text-xs flex-1`}
                                               href={`/event/checkin/${eventDetail.id}`}>
                                                <span>{lang['Check-In']}</span>
                                            </a>
                                        </div>
                                        : currProfileCheckedIn
                                            ? <div className="flex-row-item-center mt-2">
                                                <Button disabled={true} variant={'secondary'}
                                                        className="text-xs flex-1">
                                                    {lang['Checked']}
                                                </Button>
                                            </div>
                                            : null
                                }
                            </div>
                            : <SignInPanel lang={lang}/>
                        }
                    </>
                }
            </div>

            <div className="flex-1 sm:mr-9 order-2 sm:order-1">
                <div className="text-4xl font-semibold w-full">
                    {eventDetail.title}
                </div>

                <div className="flex-row-item-center my-3">
                    {eventDetail.status === 'pending' && <Badge variant='pending' className="mr-1">Pending</Badge>}
                    {eventDetail.status === 'cancel' && <Badge variant='cancel' className="mr-1">Canceled</Badge>}
                    {isEventClosed && <Badge variant='cancel' className="mr-1">Closed</Badge>}

                    {eventProcess === 'ongoing' && <Badge variant='ongoing' className="mr-1">Ongoing</Badge>}
                    {eventProcess === 'past' && <Badge variant='past' className="mr-1">Past</Badge>}
                    {eventProcess === 'upcoming' && <Badge variant='upcoming' className="mr-1">Upcoming</Badge>}


                    {isEventCreator && <Badge variant='hosting' className="mr-1">Hosting</Badge>}
                    {currProfileAttended && <Badge variant='joining' className="mr-1">Joining</Badge>}
                </div>

                <div className="my-4 border-t-[1px] border-b-[1px] border-gray-300">
                    <div className="hide-scroll whitespace-nowrap overflow-auto">
                        {
                            !!groupHost ? <a
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={`/group/${groupHost.group!.handle}`}>
                                    <Avatar profile={groupHost.group!} size={44} className="mr-2"/>
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {groupHost.nickname}
                                        </div>
                                        <div className="text-xs text-gray-400">{lang['Host']}</div>
                                    </div>
                                </a>
                                : <a
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={`/profile/${owner.handle}`}>
                                    <Avatar profile={owner} size={44} className="mr-2"/>
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
                                         src={getAvatar(role.item_id, role.image_url)} alt=""/>
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {role.nickname}
                                        </div>
                                        <div className="text-xs text-gray-400">Co-Host</div>
                                    </div>
                                </a>
                            })
                        }
                    </div>

                    <div className="hide-scroll whitespace-nowrap overflow-auto">
                        {
                            eventDetail.event_roles?.filter(role => role.role === 'speaker').map(role => {
                                return <a key={role.id}
                                          className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                          href={role.item_id ? `/profile/${role.profile!.handle}` : undefined}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                         src={getAvatar(role.item_id, role.image_url)} alt=""/>
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {role.nickname}
                                        </div>
                                        <div className="text-xs text-gray-400">Speaker</div>
                                    </div>
                                </a>
                            })
                        }
                    </div>
                </div>

                <div>
                    <div className="flex-row-item-center py-4">
                        <div
                            className="mr-2 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                            <i className="uil-calendar-alt text-base"></i>
                        </div>
                        <div>
                            <div className="font-semibold text-base">{getEventDetailPageTimeStr(eventDetail).date}</div>
                            <div className="text-gray-400 text-base">{getEventDetailPageTimeStr(eventDetail).time}</div>
                        </div>
                    </div>
                    {!!eventDetail.location &&
                        <div className="flex-row-item-center py-4">
                            <div
                                className="mr-2 flex-shrink-0 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                                <i className="uil-location-point text-base"></i>
                            </div>
                            <div>
                                <div className="font-semibold text-base">{eventDetail.location}</div>
                                <div className="text-gray-400 text-base">
                                    {eventDetail.formatted_address}
                                    <i className="cursor-pointer uil-copy ml-1 text-lg text-foreground"/>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="ml-11 mt-[-12px]">
                        <div className="flex-row-item-center mb-2">
                            <a className="text-xs text-blue-400 cursor-pointer"
                               target={'_blank'}
                               href={genGoogleMapLinkByEvent(eventDetail)}>View map</a>
                        </div>
                    </div>
                    {!!eventDetail.meeting_url &&
                        <div className="flex-row-item-center py-4">
                            <div
                                className="mr-2 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                                <i className="uil-link text-base"></i>
                            </div>
                            <div>
                                <div className="font-semibold text-base">Online meeting</div>
                                <div className="text-gray-400 text-base">{eventDetail.meeting_url}</div>
                            </div>
                        </div>
                    }
                </div>

                <div className="flex-row-item-center font-semibold mt-6">
                    <a href={'?tab=content'}
                       className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 relative">
                        <span className="z-10">Content</span>
                        {(tab === 'content' || tab === '') &&
                            <img width={90} height={12}
                                 className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                 src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                    {isTicketEvent && <a href={'?tab=tickets'}
                                         className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">
                        <span className="z-10">Tickets</span>
                        {tab === 'tickets' &&
                            <img width={90} height={12}
                                 className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                 src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                    }
                    {/*<a href={'?tab=comments'}*/}
                    {/*   className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">*/}
                    {/*    <span className="z-10">Comments</span>*/}
                    {/*    {tab === 'comments' &&*/}
                    {/*        <img width={90} height={12}*/}
                    {/*             className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"*/}
                    {/*             src="/images/tab_bg.png" alt=""/>*/}
                    {/*    }*/}
                    {/*</a>*/}
                    {showParticipants && <a href={'?tab=participants'}
                                            className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">
                        <span className="z-10">Participants</span>
                        {tab === 'participants' &&
                            <img width={90} height={12}
                                 className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                 src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                    }
                </div>

                {!tab || tab === "content" &&
                    <div>
                        {!!seatingStyle?.length && isEventOperator &&
                            <div className="my-3 text-sm">
                                <div className="font-semibold">
                                    Seating arrangement style
                                </div>
                                <div>{seatingStyle.join(', ')}</div>
                            </div>
                        }
                        {!!avNeeds?.length && isEventOperator &&
                            <div className="my-3 text-sm">
                                <div className="font-semibold">
                                    AV needed
                                </div>
                                <div>{avNeeds.join(', ')}</div>
                            </div>
                        }

                        {!eventDetail.content && !eventDetail.notes && <NoData/>}
                        <div className="editor-wrapper display py-3">
                            <RichTextDisplayer markdownStr={eventDetail.content || ''}/>
                        </div>

                        {!!eventDetail.notes ?
                            currProfileAttended ?
                                <div className="bg-secondary border-dashed border-2 rounded-lg p-3 mt-8 ">
                                    <div className="font-semibold mb-2">{lang['Event Note']}</div>
                                    <div className="editor-wrapper display">
                                        <RichTextDisplayer markdownStr={eventDetail.notes || ''}/>
                                    </div>
                                </div>
                                : <div className="bg-secondary border-dashed border-2 rounded-lg p-3 mt-8 ">
                                    <div className="font-semibold mb-2">{lang['Attend event to view notes']}</div>
                                    <div className="bg-gray-300 w-full h-4 rounded-lg mb-2"/>
                                    <div className="bg-gray-300 w-80 h-4 rounded-lg"/>
                                </div>
                            : null
                        }
                    </div>
                }

                {tab === 'participants' &&
                    <EventParticipantList
                        lang={lang}
                        eventDetail={eventDetail}
                        currProfile={currProfile}
                        isEventOperator={isEventOperator}
                    />
                }

                {tab === 'tickets' &&
                    <div>
                        <div className="border-gray-200 p-4">
                            {!!eventDetail.tickets && eventDetail.tickets.length === 0 && <NoData/>}
                            {eventDetail.tickets?.map(ticket => {

                                return <div key={ticket.id} className="bg-gray-100 p-4 rounded-lg mb-3 cursor-pointer">
                                    <div className="font-semibold">{ticket.title}</div>
                                    <div className="text-xs my-2 break-words text-gray-500">
                                        {ticket.content}
                                    </div>
                                    {!!ticket.check_badge_class &&
                                        <div>
                                            <div className="text-sm text-gray-500 mb-2">Need to have badge</div>
                                            <div className="flex-row-item-center">
                                                <img className="w-6 h-6 mr-2 rounded-full"
                                                     src={ticket.check_badge_class.image_url!} alt=""/>
                                                <div>{ticket.check_badge_class.title}</div>
                                            </div>
                                        </div>
                                    }

                                    {ticket.payment_methods?.length === 0 ?
                                        <div className="flex flex-row items-center justify-between mt-3">
                                            <div className="font-semibold text-pink-500 text-xl">Free</div>
                                        </div>
                                        : <div className="flex flex-row items-center justify-between mt-3">
                                            <div className="font-semibold text-pink-500 text-xl">
                                                {displayTicketPrice(ticket)}
                                            </div>
                                            <div className="flex flex-row items-center">
                                                {
                                                    ticket.payment_methods.map((method, index) => {
                                                        return <img key={index}
                                                                    className="shadow min-w-5 h-5 rounded-full mr-[-6px] bg-white"
                                                                    src={getChainIconById(method.chain)}
                                                                    alt="" width={20} height={20}/>
                                                    })
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                            })
                            }
                        </div>
                    </div>
                }

                {tab === 'comments' && <div>
                    <div className="py-4">
                        {!!currProfile &&
                            <div className="flex flex-row  w-full !items-start">
                                <img className="w-9 h-9 rounded-full mr-2"
                                     src={getAvatar(currProfile.id, currProfile.image_url)} alt=""/>
                                <Textarea className="flex-1" placeholder={'Input comment'}/>
                            </div>
                        }
                        <NoData/>
                    </div>
                </div>}

            </div>
        </div>
    </div>
}
