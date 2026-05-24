'use client'

import {getLabelColor, getLightColor} from "@/utils/label_color"
import {useEffect} from "react"
import {IframeSchedulePageDataEvent} from "@/app/(iframe)/schedule/data"
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'
import {Dictionary} from '@/lang'


export default function DailyViewAllDayEventItem({event, timezone, lang}: {event: IframeSchedulePageDataEvent, timezone: string, lang: Dictionary}) {
    const {showPopup} = useScheduleEventPopup()

    const themColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
    const bgColor = getLightColor(themColor, 0.93)


    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup(event.id, event.group_id, event.is_starred, lang)
    }, [])

    return <div className="w-ful shadow lrounded p-2 overflow-hidden duration-300 hover:z-[999] hover:scale-[1.01] relative cursor-pointer mb-0.5"
        onClick={() => showPopup(event.id, event.group_id, event.is_starred, lang)} style={{background: bgColor}}>
        <div className="absolute w-[2px] h-full left-0 top-0" style={{background: themColor}}/>
        <div className="font-sm font-semibold">{event.title}</div>
    </div>
}
