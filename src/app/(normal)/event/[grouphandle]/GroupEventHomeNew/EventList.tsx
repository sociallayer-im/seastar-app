'use client'

import {EventListFilterProps, EventWithJoinStatus, getEvents} from '@sola/sdk'
import EventHomeFilterNew, {EventHomeFilterProps} from '@/components/client/EventHomeFilterNew'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import {useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function EventHomeEventList({filterOpts, groupDetail, isManager, lang, events}: EventHomeFilterProps & {
    events: EventWithJoinStatus[]
}) {
    const [currEvents, setCurrEvents] = useState(events)
    const {showLoading, closeModal} = useModal()

    const updateList = async (filterOpts: EventListFilterProps) => {
        const loading = showLoading()
        try {
            const events = await getEvents({
                params: {
                    filters: {
                        ...filterOpts,
                        group_id: groupDetail.id + '',
                        timezone: groupDetail.timezone || undefined
                    },
                    authToken: getAuth()
                }, clientMode: CLIENT_MODE
            })
            setCurrEvents(events)
        } catch (e) {
            console.error(e)
        } finally {
            closeModal(loading)
        }
    }

    return <>
        <EventHomeFilterNew
            filterOpts={filterOpts}
            onFiltered={(filterOpts) => {updateList(filterOpts)}}
            groupDetail={groupDetail} isManager={isManager} lang={lang}/>

        <div className="my-3">
            <EventListGroupedByDate events={currEvents} group={groupDetail} lang={lang}/>
        </div>
    </>
}