'use client'
import { getLabelColor, getLightColor } from "@/utils/label_color"
import { IframeSchedulePageDataEventDetail } from "./data"
import useScheduleEventPopup from '@/hooks/useScheduleEventPopup'
import { Dictionary } from "@/lang"
import Avatar from "@/components/Avatar"
import { displayProfileName } from "@/utils"
import { useState } from "react"

export default function VenueViewEventItem({ event, height, top, left, lang, width , log}: {
    event: IframeSchedulePageDataEventDetail,
    height: string,
    top: string,
    left: string,
    lang: Dictionary,
    width: number,
    log?: string
}) {

    const [highlighted, setHighlighted] = useState(event.pinned)
    const borderColor = event.tags?.[0] ? getLabelColor(event.tags?.[0]) : '#666'
    const bg = highlighted ? '#FFF7E8' : '#fff'

    const { showPopup } = useScheduleEventPopup()

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

    return (
        <div onClick={() => showPopup(event.id, event.group.id, event.is_starred, lang, (highlighted) => {
            setHighlighted(highlighted)
        })}
            className="border-2 border-gray-200 absolute rounded-lg p-2 overflow-hidden flex flex-col justify-between"
            style={{
                width: `${width}px`,
                height: height,
                top: top,
                left: left,
                backgroundColor: bg,
                borderColor: borderColor,
            }}>
            <div className="font-semibold leading-[16px] text-xs"> {event.title} </div>
            <div>{log}</div>
            <div className="flex-row-item-center text-xs truncate">
                by <Avatar profile={host} size={16}
                    className="mx-1" />
                <div className="truncate  w-[80px]">{displayProfileName(host)}</div>
            </div>
        </div>
    )
}