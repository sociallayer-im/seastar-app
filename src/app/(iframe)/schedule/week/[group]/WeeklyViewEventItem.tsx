'use client'

import OuterLink from "@/app/(iframe)/schedule/OuterLink"
import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import dayjs from "@/libs/dayjs"
import useModal from "@/components/client/Modal/useModal"
import {getEventDetail} from "@/service/solar"
import dynamic from "next/dynamic"
import {useEffect, useCallback} from "react"
import {getAvatar} from "@/utils"

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function WeeklyViewEventItem({event, timezone}: {event: IframeSchedulePageDataEventDetail, timezone: string}) {
    const {openModal, showLoading, closeModal} = useModal()

    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const isAllDay = start.hour() === 0 && start.minute() === 0 && end.hour() === 23 && end.minute() === 59
    const timeDuration = start.format('YYYY-MM-DD') !== end.format('YYYY-MM-DD') ? `${start.format('HH:mm, MMM Do')} - ${end.format('HH:mm, MMM Do')}` : `${start.format('HH:mm')} - ${end.format('HH:mm')}`

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
    const mainThemColor = event.tags[0] ? getLabelColor(event.tags[0]) : bgColor

    return <div
        className="bg-white p-2 h-[210px] text-xs scale-100 relative duration-300 cursor-pointer hover:scale-105 hover:z-[999]"
        onClick={showPopup}
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
            {
                event.tags
                    .filter(tag => !tag.startsWith(':'))
                    .slice(0, event.tagDisplayAmount).map((tag, index) => {
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
                event.tags.length > event.tagDisplayAmount ?
                    <div
                        className="border border-[#CECED3] inline-flex flex-row flex-nowrap items-center h-[26px] px-2 rounded-3xl m-[2px] !ml-0">
                        <span
                            className="overflow-ellipsis overflow-hidden whitespace-nowrap">+{event.tags.length - event.tagDisplayAmount}</span>
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
                    href={`https://www.google.com/maps/search/?api=1&query=${event.geo_lat}%2C${event.geo_lng}`}
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
