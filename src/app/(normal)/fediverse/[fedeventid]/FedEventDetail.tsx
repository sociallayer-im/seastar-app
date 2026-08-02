'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {FedEvent, joinFedEvent, leaveFedEvent} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import Dayjs from '@/libs/dayjs'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface FedEventDetailProps {
    lang: Dictionary
    event: FedEvent
    signedIn: boolean
    authToken?: string
}

/**
 * A remote event. Everything shown here is a mirror — the origin server owns
 * the record and is the only place that can change it — so the page always
 * offers a way through to the original, and never states a participation more
 * confidently than the origin has confirmed.
 */
export default function FedEventDetail({lang, event, signedIn, authToken}: FedEventDetailProps) {
    const {toast} = useToast()
    const [status, setStatus] = useState(event.my_status)
    const [busy, setBusy] = useState(false)

    const tz = event.timezone || undefined
    const start = event.start_time ? Dayjs(event.start_time).tz(tz) : null
    const end = event.end_time ? Dayjs(event.end_time).tz(tz) : null
    const cancelled = event.status === 'CANCELLED'
    const joined = status === 'attending' || status === 'pending'
    const originUrl = event.url || event.uri

    const act = async (fn: () => Promise<void>) => {
        if (!signedIn || !authToken) {
            toast({title: lang['Please sign in first']})
            return
        }
        setBusy(true)
        try {
            await fn()
        } catch (e: unknown) {
            toast({title: (e as Error).message})
        } finally {
            setBusy(false)
        }
    }

    const handleJoin = () => act(async () => {
        if (event.join_mode === 'external') {
            window.open(event.external_participation_url || originUrl, '_blank')
            return
        }
        const res = await joinFedEvent({
            params: {eventId: event.id, authToken: authToken!}, clientMode: CLIENT_MODE
        })
        setStatus(res.status as FedEvent['my_status'])
        toast({title: lang['Join requested']})
    })

    const handleLeave = () => act(async () => {
        await leaveFedEvent({params: {eventId: event.id, authToken: authToken!}, clientMode: CLIENT_MODE})
        setStatus('cancelled')
    })

    return <div className="page-width-md min-h-[80svh] px-3 py-6">
        <div className="text-xs text-secondary-foreground mb-2">
            {lang['from']} @{event.origin?.acct || event.uri}
        </div>

        <div className="font-semibold text-2xl mb-2">
            {cancelled && <span className="text-red-500 mr-2">{lang['Cancelled']}</span>}
            {event.title}
        </div>

        {!!start && <div className="mb-1 text-sm">
            {start.format('MMM D, YYYY HH:mm')}
            {end ? ` – ${end.format('HH:mm')}` : ''}
            {tz ? ` (${tz})` : ''}
        </div>}

        {!!event.location?.name && <div className="mb-1 text-sm text-secondary-foreground">
            {event.location.name}{event.location.address ? ` · ${event.location.address}` : ''}
        </div>}

        {!!event.max_participant && <div className="mb-4 text-sm text-secondary-foreground">
            {event.participant_count}/{event.max_participant}
        </div>}

        {!!event.content && <div className="my-6 prose max-w-none"
                                 dangerouslySetInnerHTML={{__html: event.content}}/>}

        <div className="flex-row-item-center gap-3 mt-8">
            {!cancelled && event.join_mode !== 'invite' && <Button
                variant={joined ? 'secondary' : 'primary'}
                disabled={busy || status === 'rejected'}
                onClick={joined && status === 'attending' ? handleLeave : handleJoin}>
                {status === 'attending' ? lang['Leave']
                    : status === 'pending' ? lang['Requested']
                        : status === 'rejected' ? lang['Declined']
                            : event.join_mode === 'external' ? lang['Register on the origin site']
                                : lang['Join']}
            </Button>}
            <a href={originUrl} target="_blank" rel="noreferrer"
               className="text-sm underline text-secondary-foreground">
                {lang['View on the origin server']}
            </a>
        </div>

        {status === 'pending' && <div className="mt-3 text-xs text-secondary-foreground">
            {lang['Join requested']}
        </div>}
    </div>
}
