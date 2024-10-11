'use client'

import {IframeSchedulePageDataEventDetail} from "@/app/(iframe)/schedule/day/[group]/data"
import {getLabelColor} from "@/utils/label_color"
import dayjs from "@/libs/dayjs"
import {getEventDetail} from "@/service/solar"
import useModal from "@/components/client/Modal/useModal"
import dynamic from 'next/dynamic'
import {useEffect, useCallback} from "react"

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function DailyViewEventItem({event, timezone}: {event: IframeSchedulePageDataEventDetail, timezone: string}) {
    const {openModal, showLoading, closeModal} = useModal()

    const themColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const timeDuration = start.date() !== end.date() ? `${start.format('HH:mm, Do')} - ${end.format('HH:mm, Do')}` : `${start.format('HH:mm')} - ${end.format('HH:mm')}`

    const showPopup = useCallback(async () => {
        const loadingModalId = showLoading()
        const eventDetail = await getEventDetail(event.id)
        closeModal(loadingModalId)

        if (!eventDetail) return

        // set search params to open the popup
        const url = new URL(window.location.href)
        url.searchParams.set('popup', event.id.toString())
        window.history.pushState({}, '', url.toString())

        openModal({
            content: () => <DynamicScheduleEventPopup event={eventDetail} timezone={timezone}/>
        })
    }, [event.id, timezone])

    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup()
    }, [])

    return <div className="w-full absolute shadow rounded p-2 overflow-hidden duration-300 hover:z-[999] hover:scale-[1.01]"
        onClick={showPopup}
        style={event.style}>
        <div className="absolute w-[2px] h-full left-0 top-0" style={{background: themColor}}/>
        <div className="text-xs">{timeDuration}</div>
        <div className="font-sm font-semibold">{event.title}</div>
    </div>
}
