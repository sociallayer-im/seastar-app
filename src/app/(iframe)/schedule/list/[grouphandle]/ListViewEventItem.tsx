'use client'

import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import useModal from "@/components/client/Modal/useModal"
import {getEventDetail} from "@/service/solar"
import dynamic from "next/dynamic"
import {useCallback} from "react"
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'

const DynamicFormatEventTime = dynamic(() => import('@/components/CardEvent/FormatEventTime'), {ssr: false})

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

    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const host: Solar.ProfileSample = groupHostRole ?
        {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        }
        : event.owner

    const bgColor = event.pinned ? '#FFF7E8' : '#fff'
    const themeColor = event.tags?.[0] ? getLabelColor(event.tags[0]) : bgColor

    return <div className="flex flex-row text-xs sm:text-base" key={event.id}>
        <div onClick={showPopup}
            className="sm:pl-7 pb-2 flex-1 relative">
            <div style={{background: bgColor}}
                className="flex flex-col flex-nowrap !items-start bg-white py-2 px-4 shadow rounded-[4px] cursor-pointer relative sm:duration-200 sm:hover:scale-105">
                <i className="h-full w-0.5 left-0 top-0 absolute" style={{background: themeColor}}/>
                <div className="flex-1 font-semibold mr-4 mb-2">{event.title}</div>
                <div className="flex-1 text-xs text-gray-500 mb-2">
                    <i className="uil-calender mr-1" />
                    <DynamicFormatEventTime
                        dateTimeStr={event.start_time}
                        tz={timezone}/>
                </div>
                {event.location &&
                    <div className="flex-1 text-xs text-gray-500 mb-2">
                        <i className="uil-location-point mr-1" />
                        {event.location}
                    </div>
                }
                <div className="text-xs text-gray-500 flex-row-item-center">
                    {event.track &&
                        <div>{event.track.title}<span className="mx-1">|</span></div>
                    }
                    <div className="flex-row-item-center">
                        by <Avatar profile={host} size={16}
                                   className="mx-1"/> {displayProfileName(host)}
                    </div>
                </div>
            </div>
        </div>
    </div>
}
