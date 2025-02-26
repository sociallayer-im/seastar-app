import {getLabelColor} from "@/utils/label_color"
import {checkProcess, EventWithJoinStatus, formatEventTime} from "@/utils"
import {Badge} from "@/components/shadcn/Badge"
import {CSSProperties, ReactElement} from "react"
import dynamic from 'next/dynamic'
import {Dictionary} from '@/lang'

const DynamicEventCardStarBtn = dynamic(() => import('@/components/client/StarEventBtn'), {ssr: false})
const DynamicFormatEventTime = dynamic(() => import('./FormatEventTime'), {ssr: false})

export default function CardEvent({event, className, id, style, lang, highlight, additionalElement}: {
    event: EventWithJoinStatus,
    lang: Dictionary,
    className?: string,
    highlight?: boolean,
    id?: string,
    additionalElement?: ReactElement
    style?: CSSProperties
}) {
    const eventProcess = checkProcess(event.start_time, event.end_time)
    const status = event.status

    const groupHost = event.event_roles?.find(r => r.role === 'group_host')
    const cohosts = event.event_roles?.filter(r => r.role === 'co_host')
    const host = groupHost?.nickname || event.owner.nickname || event.owner.handle

    const startTime = formatEventTime(event.start_time, event.timezone)

    const customStyle = {
        ...style,
        background: highlight ? '#fff7e9' : '#fff',
    }

    return <a href={`/event/detail/${event.id}`}
              id={id}
              style={customStyle}
              className={`relative shadow flex rounded-lg p-3 flex-row flex-nowrap bg-background duration-200 hover:scale-[1.02] ${className} ${highlight ? 'bg-[#f1f1f1]' : ''}`}>
        <DynamicEventCardStarBtn eventId={event.id} starred={event.isStarred}/>
        <div className="flex-1 mr-2">
            <div className="flex-row-item-center flex-wrap scale-90 sm:scale-100 origin-top-left">
                {eventProcess === 'past' && <Badge variant='past' className="mr-1">{lang['Past']}</Badge>}
                {event.display === 'private' && <Badge variant='private' className="mr-1">{lang['Private']}</Badge>}
                {status === 'pending' && <Badge variant='pending' className="mr-1">{lang['Pending']}</Badge>}
                {status === 'cancel' && <Badge variant='cancel' className="mr-1">{lang['Canceled']}</Badge>}

                {eventProcess === 'ongoing' && <Badge variant='ongoing' className="mr-1">{lang['Ongoing']}</Badge>}
                {eventProcess === 'upcoming' && <Badge variant='upcoming' className="mr-1">{lang['Upcoming']}</Badge>}

                {event.isCreator && <Badge variant='hosting' className="mr-1">{lang['Hosting']}</Badge>}
                {event.isJoined && <Badge variant='joining' className="mr-1">{lang['Attended']}</Badge>}

            </div>
            <div className="my-1 flex-row-item-center font-semibold text-sm sm:text-base webkit-box-clamp-2">
                {event.title}
            </div>
            <div className="flex-row-item-center !flex-wrap text-xs mt-1 mb-3">
                {
                    event.tags?.filter(tag => !tag.startsWith(':'))
                        .map((tag, i) => {
                            return <div key={i} className="flex-row-item-center mr-2 shrink-0">
                                <i className="w-2 h-2 rounded-full mr-1" style={{background: getLabelColor(tag)}}/>
                                <span>{tag}</span>
                            </div>
                        })
                }
            </div>
            <div className="flex-row-item-center text-xs sm:text-sm sm:my-1">
                host by {host}{!!cohosts && !!cohosts.length ? `, ${cohosts.map(c => c.nickname).join(', ')}` : ''}
            </div>
            <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                <i className="uil-calendar-alt mr-1 text-sm"/>
                <DynamicFormatEventTime
                    dateTimeStr={event.start_time}
                    tz={event.timezone} />
            </div>
            {!!event.location &&
                <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                    <i className="uil-location-point mr-1 text-sm"/>
                    <span
                        className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis">{event.location}</span>
                </div>
            }
            {!!event.meeting_url &&
                <div className="h-6 flex-row-item-center text-xs sm:text-sm">
                    <i className="uil-link mr-1 text-sm"/>
                    <span
                        className="whitespace-nowrap max-w-[160px] overflow-hidden overflow-ellipsis"> {event.meeting_url}</span>
                </div>
            }
            {!!additionalElement &&
                <div className="flex-row-item-center text-xs">
                {additionalElement}
            </div>}
        </div>
        {
            !!event.cover_url ?
                <div className="sm:w-[140px] sm:h-[140px] flex-shrink-0 flex-grow-0 w-[100px] h-[100px]">
                    <img className="w-full h-full object-cover" src={event.cover_url} alt=""/>
                </div>
                : <div className="sm:w-[140px] sm:h-[140px] flex-shrink-0 flex-grow-0 w-[100px] h-[100px]">
                    <div className="default-cover w-[452px] h-[452px] sm:scale-[0.309] scale-[0.22]">
                        <div
                            className="webkit-box-clamp-2 font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                            {event.title}
                        </div>
                        <div className="text-lg absolute font-semibold left-[76px] top-[178px]">
                            {startTime}
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
