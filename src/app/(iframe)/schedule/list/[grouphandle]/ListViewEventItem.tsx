'use client'

import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import dynamic from "next/dynamic"
import {useEffect, useState} from "react"
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'
import {Dictionary} from '@/lang'

const DynamicFormatEventDuration = dynamic(() => import('@/components/client/FormatEventDuration'), {ssr: false})

export default function ListViewEventItem({event, timezone, lang}: {
    event: IframeSchedulePageDataEventDetail,
    timezone: string,
    lang: Dictionary,
}) {
    const {showPopup} = useScheduleEventPopup()

    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const customHostRole = event.event_roles?.find(r => r.role === 'custom_host')
    const host: Solar.ProfileSample = customHostRole ?
        {
            image_url: customHostRole.image_url,
            nickname: customHostRole.nickname,
            handle: customHostRole.nickname!,
            id: customHostRole.item_id!
        }
        : groupHostRole ? {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        } : event.owner

    const [highlighted, setHighlighted] = useState(event.pinned)
    const bgColor = highlighted ? '#FFF7E8' : '#fff'
    const themeColor = event.tags?.[0] ? getLabelColor(event.tags[0]) : bgColor

    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup(event.id, event.group.id, event.is_starred, lang)
    }, [])

    return <div className="flex flex-row text-xs sm:text-base" key={event.id}>
        <div onClick={() => showPopup(event.id, event.group.id, event.is_starred, lang, (highlighted) => {
           setHighlighted(highlighted)
        })}
            className="pb-2 flex-1 relative">
            <div style={{background: bgColor}}
                className="flex flex-col flex-nowrap !items-start bg-white py-2 px-4 shadow rounded-[4px] cursor-pointer relative sm:duration-200 sm:hover:scale-105">
                <i className="h-full w-0.5 left-0 top-0 absolute" style={{background: themeColor}}/>
                <div className="flex-1 font-semibold mr-4 mb-2 flex-row-item-center">
                    {event.title}
                    {event.is_starred ?
                        <img src={'/images/starred.png'} className="w-4 h-4 ml-1" /> : null
                    }
                    {event.is_attending ?
                        <div className="flex-row-item-center !inline-flex">
                            <img src={'/images/check-circle.png'} className="w-4 h-4 ml-1" />
                            <span className="font-normal text-xs ml-1">Attending</span>
                        </div> : null
                    }
                </div>
                <div className="flex-1 text-xs text-gray-500 mb-2">
                    <i className="uil-calender mr-1" />
                    <DynamicFormatEventDuration
                        startDate={event.start_time}
                        endDate={event.end_time}
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
                        <div>
                            <span style={{color: getLabelColor(event.track.title)}}>{event.track.title}</span>
                            <span className="mx-1 text-gray-300">|</span>
                        </div>
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
