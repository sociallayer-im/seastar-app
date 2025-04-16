'use client'

import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import {Dictionary} from '@/lang'
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'
import {useEffect} from 'react'

export default function CompactViewEventItem({event, timezone, lang, lastEvent}: {
    event: IframeSchedulePageDataEventDetail,
    lastEvent?: IframeSchedulePageDataEventDetail,
    lang: Dictionary,
    timezone: string
}) {
    const {showPopup} = useScheduleEventPopup()
    const bgColor = event.pinned ? '#FFF7E8' : '#fff'
    const themeColor = event.tags?.[0] ? getLabelColor(event.tags[0]) : bgColor

    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const host: Solar.ProfileSample = groupHostRole ?
        {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        }
        : event.owner

    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup(event.id, event.group.id, event.is_starred, lang)
    }, [])

    return <div className="flex flex-row text-xs sm:text-base" key={event.id}>
        <div className="w-12 sm:w-[100px] flex-shrink-0 text-right pr-3 pt-2">
            {event.start_time === lastEvent?.start_time && event.endTimeStr === lastEvent?.endTimeStr
                ? ''
                : event.isAllDay ? 'All Day' : <div>
                    <div>{event.timeStr}</div>
                    <div className="text-gray-400 text-xs">-{event.endTimeStr}</div>
                </div>
            }
        </div>
        <div onClick={() => {
            showPopup(event.id, event.group.id, event.is_starred, lang)
        }}
             className="border-[#CECED3] border-dashed border-l pl-5 sm:pl-7 pb-2 flex-1 relative">
            <i className="w-[6px] h-[6px] block absolute bg-[#D9D9D9] rounded-full left-0 sm:top-[17px] top-3 ml-[-3px]"/>
            <div style={{background: bgColor}}
                 className="flex flex-col sm:flex-row flex-nowrap !items-start bg-white py-2 px-4 shadow rounded-[4px] cursor-pointer relative sm:duration-200 sm:hover:scale-105">
                <i className="h-full w-0.5 left-0 top-0 absolute" style={{background: themeColor}}/>
                <div className="flex-1 mr-4">
                    <div className="font-semibold flex flex-row items-center flex-wrap">
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
                {event.location &&
                    <div className="sm:text-right text-xs">{event.location}</div>
                }
            </div>
        </div>
    </div>
}
