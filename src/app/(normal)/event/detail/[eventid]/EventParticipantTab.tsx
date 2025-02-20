'use client'

import {Dictionary} from '@/lang'
import {EventDetail, ProfileDetail} from '@sola/sdk'
import {useState} from 'react'
import EventParticipantList from '@/components/client/EventParticipantList'
import EventTicketOrderList from '@/components/client/EventTicketOrderList'
import {Button} from '@/components/shadcn/Button'

export interface EventParticipantTabProps {
    lang: Dictionary,
    eventDetail: EventDetail,
    isEventOperator?: boolean,
    currProfile: ProfileDetail | null
}

export default function EventParticipantTab({
                                                lang,
                                                eventDetail,
                                                isEventOperator,
                                                currProfile
                                            }: EventParticipantTabProps) {
    const [tab, setTab] = useState<'participants' | 'orders'>('participants')

    const showOrders = eventDetail.tickets?.length && isEventOperator

    return <div>
        {!!showOrders && <div className="py-4">
            <Button
                onClick={() => {
                    setTab('participants')
                }}
                className={'text-sm mr-2'}
                variant={tab === 'participants' ? 'normal' : 'ghost'}
                size={'sm'}>
                <div>
                    {lang['Participants']}
                </div>
            </Button>
            <Button
                onClick={() => {
                    setTab('orders')
                }}
                className={'text-sm'}
                variant={tab === 'orders' ? 'normal' : 'ghost'}
                size={'sm'}>
                <div>
                    {lang['Orders']}
                </div>
            </Button>
        </div>}
        {tab === 'participants'
            ? <EventParticipantList
                lang={lang}
                eventDetail={eventDetail}
                isEventOperator={isEventOperator}
                currProfile={currProfile}/>
            : <EventTicketOrderList
                lang={lang}
                eventDetail={eventDetail}
                isEventOperator={isEventOperator}
            />
        }
    </div>
}