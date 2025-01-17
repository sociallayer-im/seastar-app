'use client'

import {getLabelColor, getLightColor} from "@/utils/label_color"
import {getEventDetail} from "@/service/solar"
import useModal from "@/components/client/Modal/useModal"
import dynamic from 'next/dynamic'
import {useEffect, useCallback} from "react"
import {IframeSchedulePageDataEvent} from "@/app/(iframe)/schedule/data"

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function DailyViewAllDayEventItem({event, timezone}: {event: IframeSchedulePageDataEvent, timezone: string}) {
    const {openModal, showLoading, closeModal} = useModal()

    const themColor = event.tags && event.tags[0] ? getLabelColor(event.tags[0]) : '#000'
    const bgColor = getLightColor(themColor, 0.93)

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
            content: () => <DynamicScheduleEventPopup event={eventDetail} timezone={timezone}/>,
            onClose: () => {
                const url = new URL(window.location.href)
                url.searchParams.delete('popup')
                window.history.pushState({}, '', url.toString())
            }
        })
    }, [event.id, timezone])

    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup()
    }, [])

    return <div className="w-ful shadow lrounded p-2 overflow-hidden duration-300 hover:z-[999] hover:scale-[1.01] relative cursor-pointer mb-0.5"
        onClick={showPopup} style={{background: bgColor}}>
        <div className="absolute w-[2px] h-full left-0 top-0" style={{background: themColor}}/>
        <div className="font-sm font-semibold">{event.title}</div>
    </div>
}
