'use client'

import { getLabelColor } from "@/utils/label_color"
import { checkProcess, eventCoverTimeStr } from "@/utils"
import { Badge } from "@/components/shadcn/Badge"
import { CSSProperties, ReactElement, useState, type MouseEvent } from "react"
import dynamic from 'next/dynamic'
import { Dictionary } from '@/lang'
import { EventWithJoinStatus } from '@sola/sdk'
import EventKindLabel from "@/components/EventKind"
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'

const DynamicEventCardStarBtn = dynamic(() => import('@/components/client/StarEventBtn'), { ssr: false })
const DynamicFormatEventDuration = dynamic(() => import('@/components/client/FormatEventDuration'), { ssr: false })
const DynamicHighLightEventBtn = dynamic(() => import('@/components/client/HighLightEventBtn'), { ssr: false })

export default function CardEvent({ event, className, id, style, lang, highlight, additionalElement, isManager }: {
    event: EventWithJoinStatus,
    lang: Dictionary,
    className?: string,
    highlight?: boolean,
    id?: string,
    additionalElement?: ReactElement,
    style?: CSSProperties,
    isManager?: boolean
}) {
    const eventProcess = checkProcess(event.start_time, event.end_time)
    const status = event.status
    const [highlighted, setHighlighted] = useState(highlight)
    const { showPopup } = useScheduleEventPopup()

    const customHost = event.event_roles?.find(r => r.role === 'custom_host')
    const groupHost = event.event_roles?.find(r => r.role === 'group_host')
    const cohosts = event.event_roles?.filter(r => r.role === 'co_host')
    const host = customHost?.nickname || groupHost?.nickname || event.owner.nickname || event.owner.handle

    const customStyle = {
        ...style,
        background: highlighted ? '#fff7e9' : '#fff',
    }

    const handleShowPopup = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        showPopup(event.id,
            ((event as any).group?.id || event.group_id || ''),
            event.is_starred,
            lang,
            (highlighted) => {
                setHighlighted(highlighted)
            })
    }

    return <a href={`/event/detail/${event.id}`}
        onClick={handleShowPopup}
        id={id}
        style={customStyle}
        className={`overflow-hidden relative shadow flex rounded-lg p-3 xs:flex-row flex-col flex-nowrap bg-background duration-200 hover:scale-[1.02] ${className} ${highlight ? 'bg-[#f1f1f1]' : ''}`}>
        <DynamicEventCardStarBtn eventId={event.id} starred={event.is_starred} />
        {isManager &&
            <DynamicHighLightEventBtn
                onHighlighted={(highlighted) => {
                    setHighlighted(highlighted)
                }}
                event={event}
                lang={lang}
                className="absolute right-11 top-[18px] z-10"
                compact />
        }
        <div className="flex-1 mr-2 order-2 xs:order-1">
            <div className="flex-row-item-center flex-wrap scale-90 sm:scale-100 origin-top-left">
                {eventProcess === 'past' && <Badge variant='past' className="mr-1">{lang['Past']}</Badge>}
                {event.display === 'private' && <Badge variant='private' className="mr-1">{lang['Private']}</Badge>}
                {status === 'pending' && <Badge variant='pending' className="mr-1">{lang['Pending']}</Badge>}
                {status === 'cancelled' && <Badge variant='cancel' className="mr-1">{lang['Cancelled']}</Badge>}

                {eventProcess === 'ongoing' && <Badge variant='ongoing' className="mr-1">{lang['Ongoing']}</Badge>}
                {eventProcess === 'upcoming' && <Badge variant='upcoming' className="mr-1">{lang['Upcoming']}</Badge>}

                {event.is_owner && <Badge variant='hosting' className="mr-1">{lang['Hosting']}</Badge>}
                {event.is_attending && <Badge variant='joining' className="mr-1">{lang['Attended']}</Badge>}

            </div>
            <div className="my-1 flex-row-item-center font-semibold text-sm sm:text-base webkit-box-clamp-2">
                <EventKindLabel kind={event.kind} />{event.title}
            </div>
            <div className="flex-row-item-center !flex-wrap text-xs mt-1 mb-3">
                {
                    event.tags?.filter(tag => !tag.startsWith(':'))
                        .map((tag, i) => {
                            return <div key={i} className="flex-row-item-center mr-2 shrink-0">
                                <i className="w-2 h-2 rounded-full mr-1" style={{ background: getLabelColor(tag) }} />
                                <span>{tag}</span>
                            </div>
                        })
                }
            </div>
            <div className="flex flex-col text-xs sm:text-sm my-1">
                {event.track &&
                    <div>
                        <span style={{ color: getLabelColor(event.track.title) }}>{event.track.title}</span>
                    </div>
                }
                <div>hosted by {host}{!!cohosts && !!cohosts.length ? `, ${cohosts.map(c => c.nickname).join(', ')}` : ''}</div>
            </div>
            <div className="min-h-6 flex text-xs sm:text-sm">
                <i className="uil-calendar-alt mr-1 text-sm" />
                <div className="mt-0.5 sm:mt-0"><DynamicFormatEventDuration
                    startDate={event.start_time}
                    endDate={event.end_time}
                    tz={event.timezone} /></div>
            </div>
            {!!event.venue &&
                <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                    <i className="uil-location-point mr-1 text-sm" />
                    <span
                        className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis">{event.venue.title}</span>
                </div>
            }
            {!!event.location && !event.venue &&
                <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                    <i className="uil-location-point mr-1 text-sm" />
                    <span
                        className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis">{event.location}</span>
                </div>
            }
            {!!event.meeting_url &&
                <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                    <i className="uil-link mr-1 text-sm" />
                    <span
                        className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis"> {event.meeting_url}</span>
                </div>
            }
            {!!(event as any).group &&
                <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                    <i className="uil-users-alt mr-1 text-sm" />
                    <span
                        className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis">
                        {(event as any).group.nickname || (event as any).group.handle}</span>
                </div>
            }
            {!!additionalElement &&
                <div className="flex-row-item-center text-xs">
                    {additionalElement}
                </div>}
        </div>
        {
            !!event.cover_url ?
                <div className="sm:w-[140px] sm:h-[140px] flex-shrink-0 flex-grow-0 w-[100px] h-[100px] order-1 xs:order-2 xs:mb-0 mb-2">
                    <img className="w-full h-full object-cover" src={event.cover_url} alt="" />
                </div>
                : <div className="sm:w-[140px] sm:h-[140px] flex-shrink-0 flex-grow-0 w-[100px] h-[100px] order-1 xs:order-2 xs:mb-0 mb-2">
                    <div className="default-cover w-[452px] h-[452px] sm:scale-[0.309] scale-[0.22]">
                        <div
                            className="webkit-box-clamp-2 font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                            {event.title}
                        </div>
                        <div className="text-lg absolute font-semibold left-[76px] top-[178px]">
                            {eventCoverTimeStr(event.start_time!, event.timezone!).date}
                            <br />
                            {eventCoverTimeStr(event.start_time!, event.timezone!).time}
                        </div>
                        {!!event.location &&
                            <div className="text-lg absolute font-semibold left-[76px] top-[240px]">
                                {event.location}
                            </div>
                        }
                    </div>
                </div>
        }
    </a>
}
