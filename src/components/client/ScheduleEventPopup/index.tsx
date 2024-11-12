import dayjs from "@/libs/dayjs"
import {checkProcess, genGoogleMapLink, getAvatar} from "@/utils"
import {getLabelColor} from "@/utils/label_color"
import RichTextDisplayer from "@/components/client/Editor/Displayer"
import Cookies from 'js-cookie'
import {buttonVariants} from "@/components/shadcn/Button"
import {Badge} from '@/components/shadcn/Badge'

export default function ScheduleEventPopup({event, timezone} : {event: Solar.Event, timezone: string}) {
    const startTime = dayjs.tz(new Date(event.start_time), timezone)
    const endTime = dayjs.tz(new Date(event.end_time), timezone)

    let interval = `${startTime.format('HH:mm Do')} - ${endTime.format('HH:mm Do')}, ${startTime.format('MMMM')}`
    if (startTime.format('YYYY-MM-DD') != endTime.format('YYYY-MM-DD')) {
        interval = `${startTime.format('HH:mm Do')}, ${startTime.format('MMMM')} - ${endTime.format('HH:mm Do')}, ${endTime.format('MMMM')}`
    }

    const eventProcess = checkProcess(event.start_time, event.end_time)

    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const host: Solar.ProfileSample = groupHostRole ?
        {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        }
        : event.owner

    let referer = process.env.NEXT_PUBLIC_APP_URL + '/'
    if (Cookies.get('referer')) {
        try {
            referer = new URL(Cookies.get('referer')!).href
        } catch (e){
            console.log(e)
        }
    }

    return <div className="max-h-[90svh] overflow-auto sm:max-w-[725px] max-w-[365px] w-[95vw] shadow bg-[--background] sm:p-9 rounded-lg p-3">
        <div className="flex flex-row flex-nowrap">
            <div className="flex-1">
                <div className="text-xs font-semibold sm:my-3 my-2">{interval}</div>
                <div className="flex-row-item-center sm:my-2 my-1">
                    {eventProcess === 'ongoing' && <Badge variant='ongoing'>Ongoing</Badge>}
                    {eventProcess === 'past' && <Badge variant='past'>Past</Badge>}
                    {eventProcess === 'upcoming' && <Badge variant='upcoming'>Upcoming</Badge>}
                </div>
                <div className="sm:text-base text-sm font-semibold sm:my-2 my-1">{event.title}</div>
                {!!event.tags &&
                    <div className="flex-row-item-center sm:my-2 my-1 sm:text-base text-xs">
                        {event.tags.map((tag, index) => {
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
                        <img className="mr-1 w-4 h-4 flex-shrink-0 rounded-full" src={getAvatar(host.id, host.image_url)} alt=""/>
                        <span className="mr-1">by</span>
                        <span>{host.nickname || host.handle}</span>
                    </div>
                }
            </div>
            <div
                className="sm:w-[160px] sm:h-[160px] w-[99px] h-[99px] rounded overflow-hidden flex-grow-0 flex-shrink-0">
                {!!event.cover_url
                    ? <img src={event.cover_url} className="w-full h-full object-cover"  alt=""/>
                    : <div className="default-cover w-[452px] h-[452px] sm:scale-[0.356] scale-[0.22]">
                        <div className="font-semibold text-[27px] webkit-box-clamp-2 max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                            {event.title}
                        </div>
                        <div className="text-lg absolute font-semibold left-[76px] top-[178px]">
                            {interval}
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

        <div className="mt-3 flex-row-item-center justify-between w-full">
            <div>
                {event.location && event.geo_lng && event.geo_lat &&
                    <a target="_blank"
                        className="flex-row-item-center text-sm hover:underline"
                        href={genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)}>
                        <i className="uil-location-point mr-1"/>
                        <span className="w-[180px] sm:w-auto overflow-hidden overflow-ellipsis whitespace-nowrap">{event.location}</span>
                    </a>
                }
            </div>
            <a href={`${referer}event/detail/${event.id}`}
                className={`${buttonVariants({variant: 'normal'})}  font-semibold`}
                target="_blank"
                rel="nofollow">View Detail</a>
        </div>
    </div>
}
