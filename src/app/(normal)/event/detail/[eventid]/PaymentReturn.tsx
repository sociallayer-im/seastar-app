'use client'

import {Dictionary} from '@/lang'
import {useEffect, useRef, useState} from 'react'
import {getPurchasedTicketItemsByProfileNameAndEventId} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'

/**
 * Shown when the buyer comes back from Stripe Checkout
 * (?payment=success&ticket_item=…), which is a real redirect off-site and back.
 *
 * WeChat does NOT come through here: its sheet is drawn over our own page, so
 * the dialog waits for confirmation in place and soft-refreshes rather than
 * navigating twice (see DialogTicket#settleInPlace).
 *
 * The browser never decides payment state — a client-side "success" proves
 * nothing on either rail — so this only POLLS until the callback (or the
 * sweeper) has confirmed the order server-side.
 */
export default function PaymentReturn({lang, eventId, profileName, result}: {
    lang: Dictionary
    eventId: string
    profileName: string
    result: 'success' | 'cancelled'
}) {
    const [confirmed, setConfirmed] = useState(false)
    const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

    useEffect(() => {
        if (result !== 'success') return
        const authToken = getAuth()
        if (!authToken) return

        let ticks = 0
        timer.current = setInterval(async () => {
            ticks += 1
            if (ticks > 40) { // give up after ~2 minutes; the sweeper will settle it
                clearInterval(timer.current)
                return
            }
            try {
                const items = await getPurchasedTicketItemsByProfileNameAndEventId({
                    params: {profileName, eventId, authToken},
                    clientMode: CLIENT_MODE
                })
                if (items.length) {
                    clearInterval(timer.current)
                    setConfirmed(true)
                    // Strip the query params so a manual refresh doesn't re-poll.
                    const url = new URL(window.location.href)
                    url.searchParams.delete('payment')
                    url.searchParams.delete('ticket_item')
                    setTimeout(() => window.location.replace(url.toString()), 1500)
                }
            } catch (e) {
                console.error(e)
            }
        }, 3000)
        return () => clearInterval(timer.current)
    }, [])

    if (result === 'cancelled') {
        return <div className="rounded-lg p-3 mb-3 text-sm bg-amber-50 text-amber-700">
            {lang['Payment cancelled']}
        </div>
    }

    return <div className="rounded-lg p-3 mb-3 text-sm bg-blue-50 text-blue-700 flex-row-item-center">
        {!confirmed && <i className="mr-2 animate-spin uil-spinner-alt text-lg"/>}
        {confirmed ? lang['Payment confirmed'] : lang['Payment processing']}
    </div>
}
