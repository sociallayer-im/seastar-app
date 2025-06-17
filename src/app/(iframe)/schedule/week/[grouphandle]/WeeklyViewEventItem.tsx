'use client'

import OuterLink from "@/app/(iframe)/schedule/OuterLink"
import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import dayjs from "@/libs/dayjs"
import {useEffect, useState} from "react"
import {genGoogleMapLink, getAvatar} from "@/utils"
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'
import {Dictionary} from '@/lang'

export default function WeeklyViewEventItem({event, timezone, lang}: {event: IframeSchedulePageDataEventDetail, timezone: string, lang: Dictionary}) {
    const {showPopup} = useScheduleEventPopup()

    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const isAllDay = start.hour() === 0 && start.minute() === 0 && end.hour() === 23 && end.minute() === 59
    const timeDuration = start.format('YYYY-MM-DD') !== end.format('YYYY-MM-DD') ? `${start.format('HH:mm, MMM Do')} - ${end.format('HH:mm, MMM Do')}` : `${start.format('HH:mm')} - ${end.format('HH:mm')}`

    useEffect(() => {
        const popupEvent = new URLSearchParams(window.location.search).get('popup')
        popupEvent === event.id.toString() && showPopup(event.id, event.group.id, event.is_starred, lang)
    }, [])

    const customHostRole = event.event_roles?.find(r => r.role === 'custom_host')
    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const host: Solar.ProfileSample = customHostRole ?
        {
            image_url: customHostRole.image_url,
            nickname: customHostRole.nickname,
            handle: customHostRole.nickname!,
            id: customHostRole.item_id!
        } : groupHostRole ? {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        } : event.owner

    
    const filteredTags= event.tags && event.tags.length > 0
        ? event.tags.filter(tag => !tag.startsWith(':'))
        : []

    const [highlighted, setHighlighted] = useState(event.pinned)
    const bgColor = highlighted ? '#FFF7E8' : '#fff'
    const mainThemColor = filteredTags[0] ? getLabelColor(filteredTags[0]) : bgColor

    return <div
        className="bg-white p-2 h-[220px] text-xs scale-100 relative duration-300 cursor-pointer hover:scale-105 hover:z-[999]"
        onClick={() => showPopup(event.id, event.group.id, event.is_starred, lang)}
        style={{gridArea: event.grid, boxShadow: '0 1.988px 18px 0 rgba(0, 0, 0, 0.10)', background: bgColor}}>
        <div className="block content-[''] w-[2px] h-[210px] absolute left-0 top-0"
            style={{background: mainThemColor}}/>
        <div className="font-xs color-[#4F5150] my-1">
            {isAllDay ? 'All Day' : timeDuration}
        </div>
        <div className="font-semibold text-sm leading-[22px] h-[44px] overflow-hidden webkit-box-clamp-2">
            {event.title}
        </div>
        <div className="text-xs my-1">
            {!!event.track &&
                <div
                    className="text-xs"
                    style={{
                        color: getLabelColor(event.track.title)
                    }}>
                    {event.track.tag || event.track.title}
                </div>
            }
        </div>
        <div className="text-xs my-1">
            {filteredTags.slice(0, event.tagDisplayAmount).map((tag, index) => {
                        const themColor = getLabelColor(tag)
                        const maxWidth = event.tagDisplayAmount !== 3 ? '110px' : 'auto'

                        return <div key={index}
                            className="border border-[#CECED3] inline-flex flex-row flex-nowrap items-center h-[26px] px-2 rounded-3xl m-[2px] !ml-0"
                            style={{
                                maxWidth: maxWidth,
                                borderColor: themColor
                            }}>
                            <i className="w-2 h-2 mr-1 rounded-full shrink-0" style={{background: themColor}}/>
                            <span className="overflow-ellipsis overflow-hidden whitespace-nowrap">{tag}</span>
                        </div>
                    })
            }
            {
                filteredTags.length > event.tagDisplayAmount ?
                    <div
                        className="border border-[#CECED3] inline-flex flex-row flex-nowrap items-center h-[26px] px-2 rounded-3xl m-[2px] !ml-0">
                        <span
                            className="overflow-ellipsis overflow-hidden whitespace-nowrap">+{filteredTags.length - event.tagDisplayAmount}</span>
                    </div>
                    : null
            }
        </div>
        <div>
            <div className="flex-row-item-center">
                <img src={getAvatar(host.id, host.image_url)} width={12} height={12} className="rounded-full mr-1"
                    alt=""/>
                <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                   by {host.nickname || host.handle}
                </span>
            </div>
        </div>

        <div className="absolute right-2 bottom-2 flex flex-col flex-nowrap items-start">
            {!!event.location ?
                <OuterLink
                    text={event.location}
                    href={genGoogleMapLink(event.geo_lat!, event.geo_lng!, event.location_data)}
                />
                : null
            }

            {!!event.meeting_url ?
                <OuterLink
                    text={'Online meeting'}
                    href={event.meeting_url}
                />
                : null
            }
        </div>
    </div>
}
