'use client'

import {IframeSchedulePageDataEventDetail} from "./data"
import {getLabelColor} from "@/utils/label_color"
import useModal from "@/components/client/Modal/useModal"
import {getEventDetail} from "@/service/solar"
import dynamic from "next/dynamic"
import {useCallback} from "react"
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function CompactViewEventItem({event, timezone, lastEvent}: {
    event: IframeSchedulePageDataEventDetail,
    lastEvent?: IframeSchedulePageDataEventDetail,
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

    const groupHostRole = event.event_roles?.find(r => r.role === 'group_host')
    const host: Solar.ProfileSample = groupHostRole ?
        {
            image_url: groupHostRole.image_url,
            nickname: groupHostRole.nickname,
            handle: groupHostRole.nickname!,
            id: groupHostRole.item_id!
        }
        : event.owner

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
        <div onClick={showPopup}
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
                            <div>{event.track.title}<span className="mx-1">|</span></div>
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
