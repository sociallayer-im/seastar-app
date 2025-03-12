'use client'

import {IframeSchedulePageDataEventDetail} from "@/app/(iframe)/schedule/day/[grouphandle]/data"
import {getLabelColor} from "@/utils/label_color"
import dayjs from "@/libs/dayjs"
import {useEffect} from "react"
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'
import {Dictionary} from '@/lang'

export default function DailyViewEventItem({event, timezone, lang}: {event: IframeSchedulePageDataEventDetail, timezone: string, lang: Dictionary}) {
    const {showPopup} = useScheduleEventPopup()

    const themColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const timeDuration = start.format('YYYY-MM-DD') !== end.format('YYYY-MM-DD') ? `${start.format('HH:mm, MMM Do')} - ${end.format('HH:mm, MMM Do')}` : `${start.format('HH:mm')} - ${end.format('HH:mm')}`

    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup(event.id, event.is_starred, lang)
    }, [])

    return <div className="w-full absolute shadow rounded p-2 overflow-hidden duration-300 hover:z-[999] hover:scale-[1.01] cursor-pointer"
        onClick={() => showPopup(event.id, event.is_starred, lang)}
        style={event.style}>
        <div className="absolute w-[2px] h-full left-0 top-0" style={{background: themColor}}/>
        <div className="text-xs">{timeDuration}</div>
        <div className="font-sm font-semibold">{event.title}</div>
    </div>
}
