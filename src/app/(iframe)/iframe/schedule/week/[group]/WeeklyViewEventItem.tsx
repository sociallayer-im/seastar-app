'use client'

import OuterLink from "@/app/(iframe)/iframe/schedule/week/[group]/OuterLink"
import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import dayjs from "@/libs/dayjs"
import useModal from "@/components/client/Modal/useModal"
import {getEventDetail} from "@/service/solar"
import dynamic from "next/dynamic"

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function WeeklyViewEventItem({event, timezone}: {event: IframeSchedulePageDataEventDetail, timezone: string}) {
    const {openModal, showLoading, closeModal} = useModal()

    const mainThemColor = event.tags[0] ? getLabelColor(event.tags[0]) : '#fff'
    const start = dayjs.tz(new Date(event.start_time).getTime(), timezone)
    const end = dayjs.tz(new Date(event.end_time).getTime(), timezone)
    const isAllDay = start.hour() === 0 && start.minute() === 0 && end.hour() === 23 && end.minute() === 59
    const timeDuration = start.date() !== end.date() ? `${start.format('HH:mm, Do')} - ${end.format('HH:mm, Do')}` : `${start.format('HH:mm')} - ${end.format('HH:mm')}`

    const showPopup = async () => {
        const loadingModalId = showLoading()
        const eventDetail = await getEventDetail(event.id)
        closeModal(loadingModalId)

        if (!eventDetail) return

        openModal({
            content: () => <DynamicScheduleEventPopup event={eventDetail} timezone={timezone}/>
        })
    }

    return <div className="bg-white p-2 h-[194px] text-xs scale-100 relative duration-300 cursor-pointer hover:scale-105 hover:z-[999]"
        onClick={showPopup}
        style={{gridArea: event.grid, boxShadow: '0 1.988px 18px 0 rgba(0, 0, 0, 0.10)'}}>
        <div className="block content-[''] w-[2px] h-[194px] absolute left-0 top-0" style={{background: mainThemColor}}/>
        <div className="font-xs color-[#4F5150] my-1">
            {isAllDay ? 'All Day': timeDuration}
        </div>
        <div className="font-semibold text-sm leading-[22px] h-[44px] overflow-hidden webkit-box-clamp-2">
            {event.title}
        </div>
        <div className="text-xs my-1">
            {
                event.tags.slice(0, event.tagDisplayAmount).map((tag, index) => {
                    const themColor = getLabelColor(tag)
                    const maxWidth = event.tagDisplayAmount !== 3 ? '110px' : 'auto'

                    return <div key={index}
                        className="border border-[#CECED3] inline-flex flex-row flex-nowrap items-center h-[26px] px-2 rounded-3xl m-[2px] !ml-0"
                        style={{
                            maxWidth: maxWidth,
                            borderColor: themColor
                        }}>
                        <i className="w-2 h-2 mr-1 rounded-full shrink-0" style={{background: themColor}} />
                        <span className="overflow-ellipsis overflow-hidden text-nowrap">{tag}</span>
                    </div>
                })
            }
            {
                event.tags.length > event.tagDisplayAmount ?
                    <div className="border border-[#CECED3] inline-flex flex-row flex-nowrap items-center h-[26px] px-2 rounded-3xl m-[2px] !ml-0">
                        <span className="overflow-ellipsis overflow-hidden text-nowrap">+{event.tags.length - event.tagDisplayAmount}</span>
                    </div>
                    : null
            }
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
