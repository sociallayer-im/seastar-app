import EventDetailPage, {
    EventDetailPageDataProps,
    EventDetailPageSearchParams
} from "@/app/(normal)/event/detail/[eventid]/data"
import {cookies} from "next/headers"
import {
    displayTicketPrice,
    eventCoverTimeStr,
    genGoogleMapLinkByEvent,
    getAvatar,
    getEventDetailPageTimeStr
} from "@/utils"
import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"
import {getChainIconById} from "@/utils/payment_setting"
import RichTextDisplayer from "@/components/client/Editor/Displayer"

export async function generateMetadata({params, searchParams}: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams
}) {
    const {eventDetail} = await EventDetailPage({params, searchParams, cookies: cookies()})

    return {
        title: `${eventDetail.title} | Social Layer`
    }
}

export default async function EventDetail({params, searchParams}: {
    params: EventDetailPageDataProps,
    searchParams: EventDetailPageSearchParams
}) {
    const {eventDetail, group, currProfile, groupHost, owner, tab} = await EventDetailPage({
        params,
        searchParams,
        cookies: cookies()
    })
    const {lang} = await selectLang()

    return <div className="page-width !pt-6 !pb-12">
        <div className="flex flex-row items-center justify-between mb-8">
            <a href={`/event/${group.handle}`} className="flex-row-item-center">
                <img className="w-6 h-6 rounded-full mr-1" src={getAvatar(group.id, group.image_url)}
                    alt=""/>
                <span
                    className="font-semibold font-sm overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[120px] sm:max-w-max">
                    {group.nickname || group.handle}
                </span>
            </a>

            <div className="flex-row-item-center">
                <a href={`/event/edit/${eventDetail.id}`}
                    className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-4 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                    <i className="uil-edit-alt mr-1"></i>
                    <span>{lang['Edit']}</span>
                </a>
                <a href="/share"
                    className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-4 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                    <i className="uil-external-link-alt mr-1"></i>
                    <span>{lang['Share']}</span>
                </a>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row">
            <div className="min-w-[324px] sm:max-w-[324px] max-mb-8 order-1 sm:order-2 sm:mb-0">
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
                                    className="text-lg absolute font-semibold left-[76px] top-[178px]">{eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).date}
                                    <br/>
                                    {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).time}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[240px]">{eventDetail.location}</div>
                            </div>
                        </div>
                }


                <div className="border-gray-200 border rounded-lg p-4 mt-6">
                    <div className="flex-row-item-center text-xs">
                        <img className="w-6 h-6 rounded-full mr-1"
                            src={getAvatar(currProfile?.id, currProfile?.image_url)} alt=""/>
                        <span>{currProfile?.nickname || currProfile?.handle}</span>
                    </div>
                    <div className="my-2">{lang['You have registered for the event.']}</div>
                    <div className="my-2">{lang['Welcome! To join the event, please register below.']}</div>

                    <div className="flex-row-item-center">
                        <Button variant={'secondary'} className="text-xs flex-1">
                            <i className="uil-calendar-alt text-base"></i>
                            <span>{lang['Add to Calendar']}</span>
                        </Button>
                        <Button variant={'secondary'} className="text-xs flex-1 ml-2">
                            <i className="uil-calendar-alt text-base"></i>
                            <span>{lang['FeedBack']}</span>
                        </Button>
                    </div>

                    <div className="flex-row-item-center mt-2">
                        <Button variant={'special'} className="text-xs flex-1">
                            <span>{lang['Join Event']}</span>
                        </Button>
                    </div>

                    <div className="flex-row-item-center mt-2">
                        <Button variant={'secondary'} className="text-xs flex-1">
                            <span>{lang['Check-In']}</span>
                        </Button>
                    </div>

                    <div className="flex-row-item-center mt-2">
                        <Button variant={'secondary'} className="text-xs flex-1">
                            <span>{lang['Check-In For Participants']}</span>
                        </Button>
                    </div>

                    <div className="flex-row-item-center mt-2">
                        <Button variant={'secondary'} className="text-xs flex-1">
                            <span>{lang['Check-In And Send POAP']}</span>
                        </Button>
                    </div>
                </div>

                <div className="mt-6 hidden sm:block">
                    <div className="font-semibold mb-2">{lang['Tickets']}</div>
                    <div className="border border-gray-200 p-4 rounded-lg">
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

                        <Button variant={'special'} className="mt-2 w-full">RSVP</Button>

                        <Button variant={'secondary'} disabled
                            className="mt-2 w-full">{lang['You have purchased the ticket']}</Button>
                    </div>
                </div>
            </div>


            <div className="flex-1 sm:mr-9 order-2 sm:order-1">
                <div className="text-4xl font-semibold w-full">{eventDetail.title}</div>

                <div className="my-4 border-t-[1px] border-b-[1px] border-gray-300">
                    <div className="hide-scroll whitespace-nowrap overflow-auto">
                        {
                            !!groupHost ? <a
                                className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                href={`/group/${groupHost.group!.handle}`}>
                                <img className="w-11 h-11 rounded-full mr-2"
                                    src={getAvatar(groupHost.item_id, groupHost.image_url)} alt=""/>
                                <div>
                                    <div className="font-semibold text-sm text-nowrap">
                                        {groupHost.nickname}
                                    </div>
                                    <div className="text-xs text-gray-400">Host</div>
                                </div>
                            </a>
                                : <a
                                    className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                                    href={`/profile/${owner.handle}`}>
                                    <img className="w-11 h-11 rounded-full mr-2"
                                        src={getAvatar(owner.id, owner.image_url)} alt=""/>
                                    <div>
                                        <div className="font-semibold text-sm text-nowrap">
                                            {owner.nickname || owner.handle}
                                        </div>
                                        <div className="text-xs text-gray-400">Host</div>
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
                                    href={role.item_id ? `/profile/${role.profile!.handle}` : '#'}>
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
                        { (tab === 'content' || tab === '') &&
                            <img width={90} height={12}
                                className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                    <a href={'?tab=tickets'}
                        className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">
                        <span className="z-10">Tickets</span>
                        { tab === 'tickets' &&
                            <img width={90} height={12}
                                className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                    <a href={'?tab=comments'}
                        className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">
                        <span className="z-10">Comments</span>
                        { tab === 'comments' &&
                            <img width={90} height={12}
                                className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                    <a href={'?tab=participants'}
                        className="flex-1 text-center cursor-pointer text-sm sm:text-base py-1 px-2 sm:mr-3 mr-0 relative border-l-[1px] border-gray-200">
                        <span className="z-10">Participants</span>
                        { tab === 'participants' &&
                            <img width={90} height={12}
                                className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                                src="/images/tab_bg.png" alt=""/>
                        }
                    </a>
                </div>

                {!tab || tab === "content" &&
                    <div>
                        <div className="editor-wrapper display">
                            <RichTextDisplayer markdownStr={eventDetail.content || ''}/>
                        </div>

                        {!!eventDetail.notes &&
                            <>
                                <div className="mt-8 font-semibold">Event Note</div>
                                <div className="editor-wrapper display">
                                    <RichTextDisplayer markdownStr={eventDetail.notes || ''}/>
                                </div>
                            </>
                        }
                    </div>
                }

                {tab === 'participants' &&
                    <div>
                        <div className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                            <i className="uil-download-alt text-lg mr-1"></i>
                            <span>Download the list of all participants</span>
                        </div>

                        <div>
                            <div
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                                <div className="flex-row-item-center">
                                    <img className="w-7 h-7 rounded-full mr-2"
                                        src="https://ik.imagekit.io/soladata/kr4xhw63_b07ojmpkv"/>
                                    <div className="text-xs">
                                        <div>ppnnsspp</div>
                                        <div className="text-gray-400">0xasd1...asda</div>
                                    </div>
                                </div>

                                <div className="flex-row-item-center">
                                    <div className="text-xs">Free Ticket</div>
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-red-400">
                                        Cancel
                                    </div>
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-white bg-black font-semibold">
                                        Check In
                                    </div>
                                </div>
                            </div>
                            <div
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                                <div className="flex-row-item-center">
                                    <img className="w-7 h-7 rounded-full mr-2"
                                        src="https://ik.imagekit.io/soladata/kr4xhw63_b07ojmpkv"/>
                                    <div className="text-xs">
                                        <div>ppnnsspp</div>
                                        <div className="text-gray-400">0xasd1...asda</div>
                                    </div>
                                </div>

                                <div className="flex-row-item-center">
                                    <div className="text-xs">Free Ticket</div>
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-red-400">
                                        Cancel
                                    </div>
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-white bg-black font-semibold">
                                        Check In
                                    </div>
                                </div>
                            </div>
                            <div
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                                <div className="flex-row-item-center">
                                    <img className="w-7 h-7 rounded-full mr-2"
                                        src="https://ik.imagekit.io/soladata/kr4xhw63_b07ojmpkv"/>
                                    <div className="text-xs">
                                        <div>ppnnsspp</div>
                                        <div className="text-gray-400">0xasd1...asda</div>
                                    </div>
                                </div>

                                <div className="flex-row-item-center">
                                    <div className="text-xs">Free Ticket</div>
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-red-400">
                                        Cancel
                                    </div>
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-white bg-black font-semibold">
                                        Check In
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {tab === 'tickets' &&
                    <div>
                        <div className="p-4 rounded-lg">
                            <div className="bg-gray-100 p-4 rounded-lg mb-3 cursor-pointer">
                                <div className="font-semibold">Ticket Title</div>
                                <div className="text-xs my-2 break-words text-gray-500">Entrypoint event_detail 381 KiB
                                    (1.86 MiB) = event_detail/event_detail.css 105 KiB e
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">Need to have badge</div>
                                    <div className="flex-row-item-center">
                                        <img className="w-6 h-6 mr-2 rounded-full"
                                            src="https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/cvs06g2n_kARAFJMkR"
                                            alt=""/>
                                        <div>Test Badge</div>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-between mt-3">
                                    <div className="font-semibold text-pink-500 text-xl">100 USD</div>
                                    <div className="flex flex-row items-center">
                                        <img className="shadow w-5 h-5 rounded-full mr-[-6px] bg-white"
                                            src="https://www.sola.day/images/op.png" alt=""/>
                                        <img className="shadow w-5 h-5 rounded-full mr-[-6px] bg-white"
                                            src="https://www.sola.day/images/polygon.svg" alt=""/>
                                        <img className="shadow w-5 h-5 rounded-full mr-[-6px] bg-white"
                                            src="https://www.sola.day/images/ethereum-icon.webp" alt=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg mb-3 cursor-pointer">
                                <div className="font-semibold">Ticket Title</div>
                                <div className="text-xs my-2 break-words text-gray-500">Entrypoint event_detail 381 KiB
                                    (1.86 MiB) = event_detail/event_detail.css 105 KiB e
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">Need to have badge</div>
                                    <div className="flex-row-item-center">
                                        <img className="w-6 h-6 mr-2 rounded-full"
                                            src="https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/cvs06g2n_kARAFJMkR"
                                            alt=""/>
                                        <div>Test Badge</div>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-between mt-3">
                                    <div className="font-semibold text-pink-500 text-xl">100 USD</div>
                                    <div className="flex flex-row items-center">
                                        <img className="shadow w-5 h-5 rounded-full mr-[-6px] bg-white"
                                            src="https://www.sola.day/images/op.png" alt=""/>
                                        <img className="shadow w-5 h-5 rounded-full mr-[-6px] bg-white"
                                            src="https://www.sola.day/images/polygon.svg" alt=""/>
                                        <img className="shadow w-5 h-5 rounded-full mr-[-6px] bg-white"
                                            src="https://www.sola.day/images/ethereum-icon.webp" alt=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg mb-3 cursor-pointer">
                                <div className="font-semibold">Ticket Title</div>

                                <div className="flex flex-row items-center justify-between mt-3">
                                    <div className="font-semibold text-pink-500 text-xl">Free</div>
                                </div>
                            </div>

                            <div
                                className="flex-1 special-btn mt-2 h-12 cursor-pointer flex-row-item-center justify-center font-semibold bg-gray-200 rounded-lg px-2">
                                <span>RSVP</span>
                            </div>

                            <div
                                className="opacity-30 pointer-events-none flex-1 mt-2 h-12 cursor-pointer hover:bg-gray-300 flex-row-item-center justify-center font-semibold bg-gray-200 rounded-lg px-2">
                                <span>You have purchased the ticket</span>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    </div>
}
