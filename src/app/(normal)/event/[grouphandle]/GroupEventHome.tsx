'use client'

import {buttonVariants} from "@/components/shadcn/Button"
import GroupEventHomeData from '@/app/(normal)/event/[grouphandle]/data'
import {displayProfileName, getAuth} from '@/utils'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import SignInPanel from '@/components/SignInPanel'
import EventHomeFilter from '@/components/client/EventHomeFilter'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import EventHomeMap from '@/app/(normal)/event/[grouphandle]/EventHomeMap'
import { useState } from "react"
import { EventListFilterProps, EventWithJoinStatus, getEvents } from "@sola/sdk"
import { Dictionary } from "@/lang"
import useModal from '@/components/client/Modal/useModal'
import { CLIENT_MODE } from "@/app/config"
import DialogEventHomeFilter from "@/components/client/DialogEventHomeFilter"

interface GroupEventHomeProps {
    lang: Dictionary,
    langType: string,
    data: Awaited<ReturnType<typeof GroupEventHomeData>>
}

export default function GroupEventHome({data, lang, langType}: GroupEventHomeProps) {
    const {
        groupDetail,
        events,
        currProfile,
        members,
        isManager,
        filterOpts,
        mapMarkers,
        canPublishEvent
    } = data

    const {showLoading, closeModal} = useModal()

    const [eventList, setEventList] = useState<EventWithJoinStatus[]>(events)
    const [currFilter, setCurrFilter] = useState<EventListFilterProps>(filterOpts)

    const handleFilterChange = async (filter: EventListFilterProps) => {
        setCurrFilter(filter)
        const searchParams = new URLSearchParams()

        for (const key in filter) {
            const _key = key as keyof typeof filter
            if (filter[_key] && _key !== 'group_id' && _key !== 'timezone') {
                searchParams.append(key, filter[_key])
            }
        }

        window.history.replaceState({}, '', `?${searchParams.toString()}`)

        const loading = showLoading()
        try {
            const events = await getEvents({
                params: {
                    filters: {
                        ...filter,
                        group_id: groupDetail.id + '',
                        timezone: groupDetail.timezone || undefined
                    },
                    authToken: getAuth()
                }, clientMode: CLIENT_MODE
            })
            const listWithTrack = events.map(e => {
                return {
                    ...e,
                    track: e.track_id ? groupDetail.tracks.find(t => t.id === e.track_id) : null,
                }
            })
            setEventList(listWithTrack)
        } catch (e) {
            console.error(e)
        } finally {
            closeModal(loading)
        }
    }
    

    return <div style={{background: '#fff url(/images/event_home_bg.png) top center repeat-x'}}>
        <div className="page-width min-h-[100svh] sm:pt-8 pt-3 flex-col flex md:flex-row">
            <div className="flex-1 md:max-w-[648px] order-2 md:order-1">
                {groupDetail.map_enabled &&
                    <EventHomeMap
                        mapMarkers={mapMarkers}
                        lang={lang}
                        langType={langType}
                        groupHandle={groupDetail.handle}
                    />
                }
                <EventHomeFilter 
                    filterOpts={currFilter}
                    onFilterChange={handleFilterChange}
                    groupDetail={groupDetail} 
                    isManager={isManager} 
                    lang={lang}/>

                <div className="my-3">
                    <EventListGroupedByDate events={eventList} group={groupDetail} lang={lang}/>
                </div>
            </div>

            <div className="md:w-[328px] ml-0 flex-col flex order-1 md:order-2 md:ml-6 mb-6">
                <a className="flex-row-item-center justify-between  p-3 rounded-lg mb-3"
                   href={`/group/${groupDetail.handle}?tab=members`}>
                    <div className="flex-row-item-center">
                        <img src={(groupDetail.image_url && groupDetail.image_url != "") ? groupDetail.image_url : "/images/default_avatar/avatar_1.png"}
                             className="w-4 h-4 rounded-full mr-2" alt=""/>
                        <span
                            className="font-semibold text-xs whitespace-nowrap max-w-[150px] overflow-hidden overflow-ellipsis">
        {displayProfileName(groupDetail)}
        </span>
                    </div>
                    <div className='text-xs'>{members.length} {lang['Members']} <i className="uil-arrow-right"/></div>
                </a>

                <a href={`/event/${groupDetail.handle}/schedule/list`}
                   className={`${buttonVariants({variant: "warm"})} w-full`}>
                    <i className="uil-calender text-lg"/>
                    <span>{lang['Event Schedule']}</span>
                </a>

                {!!groupDetail.banner_image_url &&
                    <a href={groupDetail.banner_link_url || '/'} className="mt-3">
                        <img className="w-full h-auto"
                             src={groupDetail.banner_image_url} alt=""/>
                    </a>
                }

                {!!groupDetail.venues.length &&
                    <a href={`/event/${groupDetail.handle}/venues`}
                       className={`${buttonVariants({variant: "normal"})} w-full mt-3`}
                    >
                        <img src="/images/icon_venue.svg" alt=""/>
                        {lang['Venue List']}
                    </a>
                }


                {!!currProfile && <>
                    {canPublishEvent && groupDetail.status !== 'freezed' &&
                        <a href={`/event/${groupDetail.handle}/create`}
                           className={`${buttonVariants({variant: "special"})} w-full mt-3`}
                        >{lang['Create an Event']}</a>
                    }

                    <div className="flex-row-item-center mt-3">
                        <SelectedBadgeWannaSend
                            className={'flex-1 flex-shrink-0'}
                            lang={lang}
                            profileDetail={currProfile}
                            group={groupDetail}>
                            <div className={`${buttonVariants({variant: "secondary"})} w-full cursor-pointer`}
                            >{lang['Send a Badge']}</div>
                        </SelectedBadgeWannaSend>

                        {isManager &&
                            <a href={`/event/${groupDetail.handle}/setting`}
                               className={`${buttonVariants({variant: "secondary"})} ml-3`}>
                                {lang['Settings']}
                            </a>
                        }
                    </div>
                </>}

                {!currProfile && <SignInPanel lang={lang}/>}

                <div className="mt-6 hidden sm:block">
                <DialogEventHomeFilter
                        filterOpts={currFilter}
                        groupDetail={groupDetail}
                        lang={lang}
                        onFilterChange={handleFilterChange}
                        dialogMode="modal"
                    />
                </div>
            </div>
        </div>
    </div>
}
