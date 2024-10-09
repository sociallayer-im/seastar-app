import dayjs from "@/libs/dayjs"
import {checkProcess, getAvatar} from "@/utils"
import {getLabelColor} from "@/utils/label_color"
import RichTextDisplayer from "@/components/client/Editor/Displayer"
import Cookies from 'js-cookie'

export default function ScheduleEventPopup({event, timezone} : {event: Solar.Event, timezone: string}) {
    const startTime = dayjs.tz(new Date(event.start_time), timezone)
    const endTime = dayjs.tz(new Date(event.end_time), timezone)

    let interval = `${startTime.format('HH:mm Do')} - ${endTime.format('HH:mm Do')}, ${startTime.format('MMMM')}`
    if (startTime.date() != endTime.date()) {
        interval = `${startTime.format('HH:mm Do')}, ${startTime.format('MMMM')} - ${endTime.format('HH:mm Do')}, ${endTime.format('MMMM')}`
    }

    const eventProcess = checkProcess(event.start_time, event.end_time)

    const host = event.host_info?.group_host?.[0] || event.owner

    const referer = Cookies.get('referer')
        ? new URL(Cookies.get('referer')!).href
        : process.env.NEXT_PUBLIC_APP_URL + '/'

    return <div className="sm:max-w-[725px] max-w-[365px] w-[95vw] shadow bg-[--background] sm:p-9 rounded-lg p-3">
        <div className="flex flex-row flex-nowrap">
            <div className="flex-1">
                <div className="text-xs font-semibold sm:my-3 my-2">{interval}</div>
                <div className="flex-row-item-center sm:my-2 my-1">
                    {eventProcess === 'ongoing' && <div
                        className="badge text-xs mr-1 bg-[--ongoing-background] text-[--ongoing-foreground] rounded">Ongoing</div>}
                    {eventProcess === 'past' && <div
                        className="badge text-xs mr-1 bg-[--past-background] text-[--past-foreground] rounded">Past</div>}
                    {eventProcess === 'upcoming' && <div
                        className="badge text-xs mr-1 bg-[--upcoming-background] text-[--upcoming-foreground] rounded">Upcoming</div>}
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
                        <div className="font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
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

        <div className="my-3 sm:max-h-[250px] max-h-[200px] overflow-auto">
            <RichTextDisplayer markdownStr={event.content || ''} />
        </div>

        <div className="my-3 flex flex-row justify-end w-full">
            <a href={`${referer}event/detail/${event.id}`}
                className="btn btn-md w-full btn-neutral sm:w-auto text-white"
                target="_blank"
                rel="nofollow">View Detail</a>
        </div>
    </div>
}
