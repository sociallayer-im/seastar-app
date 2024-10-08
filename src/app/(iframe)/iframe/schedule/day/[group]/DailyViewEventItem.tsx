import {IframeSchedulePageDataEventDetail} from "@/app/(iframe)/iframe/schedule/day/[group]/data"
import {getLabelColor} from "@/utils/label_color"
import dayjs from "@/libs/dayjs"

export default function DailyViewEventItem({event, timezone}: {event: IframeSchedulePageDataEventDetail, timezone: string}) {
    const themColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const timeDuration = start.date() !== end.date() ? `${start.format('HH:mm, Do')} - ${end.format('HH:mm, Do')}` : `${start.format('HH:mm')} - ${end.format('HH:mm')}`

    return <div className="w-full absolute shadow rounded p-2 overflow-hidden duration-300 hover:z-[999] hover:scale-[1.01]"
        style={event.style}>
        <div className="absolute w-[2px] h-full left-0 top-0" style={{background: themColor}}/>
        <div className="text-xs">{timeDuration}</div>
        <div className="font-sm font-semibold">{event.title}</div>
    </div>
}
