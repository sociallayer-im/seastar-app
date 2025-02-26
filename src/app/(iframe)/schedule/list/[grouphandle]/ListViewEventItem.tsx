'use client'

import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import useModal from "@/components/client/Modal/useModal"
import {getEventDetail} from "@/service/solar"
import dynamic from "next/dynamic"
import {useCallback} from "react"

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function ListViewEventItem({event, timezone}: {
    event: IframeSchedulePageDataEventDetail,
    timezone: string
}) {
    const {openModal, showLoading, closeModal} = useModal()

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

    const bgColor = event.pinned ? '#FFF7E8' : '#fff'
    const themeColor = event.tags?.[0] ? getLabelColor(event.tags[0]) : bgColor

    return <div className="flex flex-row text-xs sm:text-base" key={event.id}>
        <div className="w-12 sm:w-[100px] flex-shrink-0 text-right pr-3 pt-2">
            {event.isAllDay ? 'All Day' : event.time}
        </div>
        <div onClick={showPopup}
            className="border-[#CECED3] border-dashed border-l pl-5 sm:pl-7 pb-2 flex-1 relative">
            <i className="w-[6px] h-[6px] block absolute bg-[#D9D9D9] rounded-full left-0 sm:top-[17px] top-3 ml-[-3px]"/>
            <div style={{background: bgColor}}
                className="flex flex-col sm:flex-row flex-nowrap !items-start bg-white py-2 px-4 shadow rounded-[4px] cursor-pointer relative sm:duration-200 sm:hover:scale-105">
                <i className="h-full w-0.5 left-0 top-0 absolute" style={{background: themeColor}}/>
                <div className="flex-1 font-semibold mr-4">{event.title}</div>
                {event.location &&
                    <div className="flex-1 sm:text-right">{event.location}</div>
                }
            </div>
        </div>
    </div>
}
