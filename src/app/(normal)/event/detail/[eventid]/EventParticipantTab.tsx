'use client'

import {Dictionary} from '@/lang'
import {
    EventDetail,
    EventOrderSummaryEntry,
    getEventOrderSummary,
    getEventParticipants,
    getEventTicketItems,
    Participant,
    ProfileDetail,
    TicketItemOrder
} from '@sola/sdk'
import {useCallback, useEffect, useState} from 'react'
import useTabParam from '@/hooks/useTabParam'
import EventParticipantList from '@/components/client/EventParticipantList'
import EventTicketOrderList from '@/components/client/EventTicketOrderList'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'

export interface EventParticipantTabProps {
    lang: Dictionary,
    eventDetail: EventDetail,
    isEventOperator?: boolean,
    canViewAllSubmissions?: boolean,
    currProfile: ProfileDetail | null
}

/**
 * The Participants / Orders pane.
 *
 * Both lists are fetched here rather than on the server with the page. The
 * attendee list used to ride along in the event detail response and the order
 * list was a second server-side call, so every visit to an event paid for both
 * — including the visits that only ever read the description. This component
 * is mounted by EventTabs the first time its tab is opened, and the orders
 * request waits for the Orders segment on top of that.
 */
export default function EventParticipantTab({
                                                lang,
                                                eventDetail,
                                                isEventOperator,
                                                canViewAllSubmissions,
                                                currProfile
                                            }: EventParticipantTabProps) {
    // `list`, so an organizer can link straight to the orders of an event —
    // ?tab=participants&list=orders. The page's own tabs use `tab`.
    const [tab, setTab] = useTabParam('list', ['participants', 'orders'] as const)

    // `null` means "not fetched yet", which is what separates the spinner from
    // a genuinely empty list.
    const [participants, setParticipants] = useState<Participant[] | null>(eventDetail.participants ?? null)
    const [orders, setOrders] = useState<TicketItemOrder[] | null>(null)
    const [summary, setSummary] = useState<EventOrderSummaryEntry[]>([])
    const [failed, setFailed] = useState(false)

    const showOrders = !!eventDetail.tickets?.length && isEventOperator

    const loadParticipants = useCallback(async () => {
        setFailed(false)
        try {
            setParticipants(await getEventParticipants({
                params: {eventId: eventDetail.id, authToken: getAuth() || undefined},
                clientMode: CLIENT_MODE
            }))
        } catch (e) {
            console.error(e)
            setFailed(true)
        }
    }, [eventDetail.id])

    const loadOrders = useCallback(async () => {
        try {
            setOrders(await getEventTicketItems({
                params: {eventId: eventDetail.id, authToken: getAuth()!},
                clientMode: CLIENT_MODE
            }))
            setSummary(await getEventOrderSummary({
                params: {eventId: eventDetail.id, authToken: getAuth()!},
                clientMode: CLIENT_MODE
            }))
        } catch (e) {
            console.error(e)
            setOrders([])
        }
    }, [eventDetail.id])

    useEffect(() => {
        if (participants === null) loadParticipants()
    }, [participants, loadParticipants])

    useEffect(() => {
        if (tab === 'orders' && orders === null) loadOrders()
    }, [tab, orders, loadOrders])

    // A segmented control rather than two standalone buttons: these are two
    // views of the same thing, and full-size buttons read as actions — on a
    // phone the solid black "Participants" button was the heaviest element on
    // the screen, competing with the tab bar right above it.
    const segment = (value: typeof tab, label: string, count?: number) =>
        <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 sm:flex-none sm:px-4 rounded-full py-1.5 text-xs sm:text-sm whitespace-nowrap transition-colors
                ${tab === value ? 'bg-white shadow-xs font-semibold text-gray-900' : 'text-gray-500'}`}>
            {label}
            {count !== undefined && <span className="ml-1 text-[11px] opacity-70">({count})</span>}
        </button>

    return <div>
        {!!showOrders && <div className="py-3">
            <div className="flex bg-gray-100 rounded-full p-1 w-full sm:w-fit">
                {segment('participants', lang['Participants'], participants?.length)}
                {segment('orders', lang['Orders'], orders?.length)}
            </div>
        </div>}

        {tab === 'participants'
            ? (participants === null
                ? <ListSkeleton failed={failed} onRetry={loadParticipants} lang={lang}/>
                : <EventParticipantList
                    lang={lang}
                    eventDetail={eventDetail}
                    participants={participants}
                    onChanged={loadParticipants}
                    isEventOperator={isEventOperator}
                    canViewAllSubmissions={canViewAllSubmissions}
                    currProfile={currProfile}/>)
            : (orders === null
                ? <ListSkeleton lang={lang}/>
                : <EventTicketOrderList
                    lang={lang}
                    orders={orders}
                    summary={summary}
                    onChanged={loadOrders}
                    isEventOperator={isEventOperator}
                />)
        }
    </div>
}

/**
 * Rows rather than a spinner: the list arrives in place, so the page doesn't
 * jump when it does.
 */
function ListSkeleton({failed, onRetry, lang}: {failed?: boolean, onRetry?: () => void, lang: Dictionary}) {
    if (failed) {
        return <div className="py-8 text-center text-sm text-gray-400">
            <div>{lang['Failed to load']}</div>
            {!!onRetry && <button className="mt-2 text-blue-400" onClick={onRetry}>{lang['Retry']}</button>}
        </div>
    }

    return <div aria-busy="true">
        {[0, 1, 2].map(i =>
            <div key={i} className="border-b border-gray-200 flex flex-row items-center py-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 mr-2"/>
                <div className="flex-1">
                    <div className="h-3 w-24 bg-gray-100 rounded-sm"/>
                    <div className="h-2 w-16 bg-gray-100 rounded-sm mt-2"/>
                </div>
            </div>
        )}
    </div>
}
