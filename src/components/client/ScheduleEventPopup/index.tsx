import dayjs from "@/libs/dayjs"
import {
    checkEventPermissionsForProfile,
    checkProcess,
    clientToSignIn, eventCoverTimeStr,
    formatEventDuration,
    genGoogleMapLink,
    getAvatar
} from "@/utils"
import {getLabelColor} from "@/utils/label_color"
import RichTextDisplayer from "@/components/client/Editor/Displayer"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Badge} from '@/components/shadcn/Badge'
import {EventDetail, GroupDetail, Profile} from '@sola/sdk'
import {Dictionary} from '@/lang'
import StarEventBtn from '@/components/client/StarEventBtn'
import AttendEventBtn from '@/components/client/AttendEventBtn'
import {useState} from 'react'

export interface ScheduleEventPopupProps {
    event: EventDetail
    lang: Dictionary
    timezone: string
    starred?: boolean
    groupDetail: GroupDetail
    profile?: Profile
}

export default function ScheduleEventPopup({event, timezone, lang, starred, profile, groupDetail} : ScheduleEventPopupProps) {
    const eventProcess = checkProcess(event.start_time, event.end_time)

    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const host: Solar.ProfileSample = groupHostRole ?
        {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        }
        : event.owner || (event as any).profile

    const {canAccess, isEventOperator, attended, checkedIn} = checkEventPermissionsForProfile(event!, groupDetail!, profile)
    const [attendedEvent, setAttendedEvent] = useState(attended)

    return <div className="max-h-[90svh] overflow-auto sm:max-w-[725px] max-w-[365px] w-[95vw] shadow bg-[--background] sm:p-9 rounded-lg p-3">
        <div className="flex flex-row flex-nowrap">
            <div className="flex-1">
                <div className="text-xs font-semibold sm:my-3 my-2">{formatEventDuration(event.start_time, event.end_time, event.timezone)}</div>
                <div className="flex-row-item-center sm:my-2 my-1">
                    {eventProcess === 'ongoing' && <Badge variant='ongoing'>Ongoing</Badge>}
                    {eventProcess === 'past' && <Badge variant='past'>Past</Badge>}
                    {eventProcess === 'upcoming' && <Badge variant='upcoming'>Upcoming</Badge>}
                </div>
                <div className="sm:text-base text-sm font-semibold sm:my-2 my-1">{event.title}</div>
                {!!event.tags &&
                    <div className="flex flex-row flex-wrap sm:my-2 my-1 sm:text-base text-xs">
                        {event.tags.filter(t => !t.startsWith(':')).map((tag, index) => {
                            return <div key={index} className="flex-row-item-center !inline-flex mr-4">
                                <i className='mr-1 w-2 h-2 shrink-0 rounded-full'
                                    style={{background: getLabelColor(tag)}}></i>
                                {tag}
                            </div>
                        })}
                    </div>
                }
                {!!host &&
                    <div className="flex-row-item-center text-xs">
                        {event.track &&
                            <div><span style={{color: getLabelColor(event.track.title)}}>{event.track.title}</span><span className="mx-1">|</span></div>
                        }
                        <img className="mr-1 w-4 h-4 flex-shrink-0 rounded-full" src={getAvatar(host.id, host.image_url)} alt=""/>
                        <span className="mr-1">by</span>
                        <span>{host.nickname || host.handle}</span>
                    </div>
                }
                {event.location && event.geo_lng && event.geo_lat &&
                    <a target="_blank"
                       className="text-xs flex-row-item-center mt-1 ml-1 hover:underline"
                       href={genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)}>
                        <i className="uil-location-point mr-1"/>
                        <span className="w-[180px] sm:w-auto overflow-hidden overflow-ellipsis whitespace-nowrap">{event.location}</span>
                    </a>
                }
            </div>
            <div
                className="sm:w-[160px] sm:h-[160px] w-[99px] h-[99px] rounded overflow-hidden flex-grow-0 flex-shrink-0 relative">
                {!!event.cover_url
                    ? <img src={event.cover_url} className="w-full h-full object-cover"  alt=""/>
                    : <div className="default-cover w-[452px] h-[452px] sm:scale-[0.356] scale-[0.22]">
                        <div className="font-semibold text-[27px] webkit-box-clamp-2 max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                            {event.title}
                        </div>
                        <div className="text-lg absolute font-semibold left-[76px] top-[178px]">
                            {eventCoverTimeStr(event.start_time!, event.timezone!).date}
                            <br/>
                            {eventCoverTimeStr(event.start_time!, event.timezone!).time}
                        </div>
                        <div className="text-lg absolute font-semibold left-[76px] top-[240px]">
                            {event.location}
                        </div>
                    </div>
                }
            </div>
        </div>

        <div className="my-3">
            <RichTextDisplayer markdownStr={event.content || ''} />
        </div>

        <div className="mt-3 flex sm:flex-row flex-col sm:justify-between w-full">
            <div className="sm:order-1 order-2 flex mt-3 justify-center sm:justify-start">
                {isEventOperator &&
                    <a href={`/event/edit/${event.id}`} className={`${buttonVariants({variant: 'ghost'})} mr-3 text-primary-foreground !font-normal  !gap-1.5`}>
                        <i className="uil-edit-alt"/>
                        {lang['Edit']}
                    </a>
                }

                <StarEventBtn
                    kind={'small'}
                    starred={!!starred}
                    eventId={event.id}
                    label={lang['Star']}/>
            </div>
            <div className="sm:order-2 order-1 flex sm:flex-row flex-col items-center">
                {canAccess && !!profile && !attendedEvent && !checkedIn && !event.tickets?.length &&
                    <AttendEventBtn
                        onAttended={() => {setAttendedEvent(true)}}
                        eventId={event.id}
                        lang={lang}
                        className="sm:mr-3 mt-3 sm:w-auto w-full" />
                }

                {canAccess && !!profile && !attendedEvent && !checkedIn && !!event.tickets?.length &&
                    <a href={`/event/detail/${event.id}?tab=tickets`}
                       className={`${buttonVariants({variant: 'special'})} sm:mr-3 mt-3 sm:w-auto w-full`}>
                        {lang['Buy Tickets']}
                    </a>
                }

                {isEventOperator &&
                    <a className={`${buttonVariants({variant: 'secondary'})} sm:mr-3 mt-3 sm:w-auto w-full`}
                       href={`/event/checkin-for-participants/${event.id}`}>
                        <span>{lang['Check-In For Participants']}</span>
                    </a>
                }

                { !checkedIn && attendedEvent && !isEventOperator &&
                    <a className={`${buttonVariants({variant: 'primary'})} sm:mr-3 mt-3 sm:w-auto w-full`}
                       href={`/event/checkin/${event.id}`}>
                        <span>{lang['Check-In']}</span>
                    </a>
                }

                { !profile &&
                    <Button  variant={'primary'}
                             className="sm:mr-3 mt-3 sm:w-auto w-full"
                             onClick={() => {clientToSignIn()}}>
                        { lang['Sign In to Attend']}
                    </Button>
                }
                <a href={`/event/detail/${event.id}`}
                   className={`${buttonVariants({variant: 'normal'})} mt-3 sm:w-auto w-full`}
                   rel="nofollow">{lang['View Details']}</a>
            </div>
        </div>
    </div>
}
