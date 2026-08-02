'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {
    FedActor, FedEvent, FedFollowing, FedJoinMode,
    followFedActor, joinFedEvent, leaveFedEvent, resolveFedActor, unfollowFedActor
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import Dayjs from '@/libs/dayjs'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface FediverseProps {
    lang: Dictionary
    events: FedEvent[]
    following: FedFollowing[]
    signedIn: boolean
    authToken?: string
}

/**
 * Events from other instances. Everything here is a mirror: the origin server
 * owns the record, so joining is a request that only it can grant — the UI
 * says "requested" until an Accept comes back rather than claiming a seat.
 */
export default function Fediverse({lang, events, following, signedIn, authToken}: FediverseProps) {
    const {toast} = useToast()
    const [handle, setHandle] = useState('')
    const [resolved, setResolved] = useState<FedActor | null>(null)
    const [busy, setBusy] = useState(false)
    const [statuses, setStatuses] = useState<Record<string, string | null | undefined>>(
        Object.fromEntries(events.map(e => [e.id, e.my_status]))
    )
    const [onlyMine, setOnlyMine] = useState(false)
    const [followed, setFollowed] = useState<FedFollowing[]>(following)

    const shown = onlyMine
        ? events.filter(e => ['attending', 'pending'].includes(statuses[e.id] || ''))
        : events

    const requireAuth = () => {
        if (!signedIn || !authToken) {
            toast({title: lang['Please sign in first'] || 'Please sign in first'})
            return false
        }
        return true
    }

    const handleResolve = async () => {
        if (!handle.trim() || !requireAuth()) return
        setBusy(true)
        try {
            const actor = await resolveFedActor({
                params: {acct: handle.trim(), authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            setResolved(actor)
        } catch (e: unknown) {
            setResolved(null)
            toast({title: (e as Error).message})
        } finally {
            setBusy(false)
        }
    }

    const handleFollow = async () => {
        if (!resolved || !requireAuth()) return
        setBusy(true)
        try {
            const res = await followFedActor({
                params: {uri: resolved.uri, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            // pending is the normal outcome: the other server decides
            toast({
                title: res.state === 'accepted'
                    ? lang['Following']
                    : lang['Follow requested']
            })
            setFollowed(list => [
                ...list.filter(f => f.uri !== resolved.uri),
                {...resolved, state: res.state as FedFollowing['state']}
            ])
        } catch (e: unknown) {
            toast({title: (e as Error).message})
        } finally {
            setBusy(false)
        }
    }

    const handleUnfollow = async (actor: FedFollowing) => {
        if (!requireAuth()) return
        setBusy(true)
        try {
            await unfollowFedActor({
                params: {uri: actor.uri, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            setFollowed(list => list.filter(f => f.uri !== actor.uri))
        } catch (e: unknown) {
            toast({title: (e as Error).message})
        } finally {
            setBusy(false)
        }
    }

    const handleJoin = async (event: FedEvent) => {
        if (!requireAuth()) return
        if (event.join_mode === 'external') {
            window.open(event.external_participation_url || event.url || event.uri, '_blank', 'noopener,noreferrer')
            return
        }
        setBusy(true)
        try {
            const res = await joinFedEvent({
                params: {eventId: event.id, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            setStatuses(s => ({...s, [event.id]: res.status}))
            toast({title: lang['Join requested']})
        } catch (e: unknown) {
            toast({title: (e as Error).message})
        } finally {
            setBusy(false)
        }
    }

    const handleLeave = async (event: FedEvent) => {
        if (!requireAuth()) return
        setBusy(true)
        try {
            await leaveFedEvent({
                params: {eventId: event.id, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            setStatuses(s => ({...s, [event.id]: 'cancelled'}))
        } catch (e: unknown) {
            toast({title: (e as Error).message})
        } finally {
            setBusy(false)
        }
    }

    return <div className="page-width min-h-[80svh] px-3 py-6">
        <div className="font-semibold text-2xl mb-1">{lang['Fediverse']}</div>
        <div className="text-sm text-secondary-foreground mb-6">
            {lang['Events from other servers in the fediverse']}
        </div>

        <div className="mb-8">
            <div className="font-semibold mb-2">{lang['Find a community on another server']}</div>
            <div className="flex-row-item-center gap-2">
                <Input className="flex-1"
                       value={handle}
                       onChange={e => setHandle(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleResolve()}
                       placeholder="@community@example.org"/>
                <Button variant="secondary" disabled={busy} onClick={handleResolve}>
                    {lang['Search']}
                </Button>
            </div>

            {!!resolved && <div className="mt-3 border rounded-lg p-3 flex-row-item-center justify-between">
                <div className="min-w-0">
                    <div className="font-semibold truncate">{resolved.name || resolved.acct}</div>
                    <div className="text-sm text-secondary-foreground truncate">
                        @{resolved.acct} · {resolved.type}
                    </div>
                </div>
                <Button variant="primary" disabled={busy} onClick={handleFollow}>
                    {lang['Follow']}
                </Button>
            </div>}
        </div>

        {!!followed.length && <div className="mb-8">
            <div className="font-semibold mb-2">{lang['Communities you follow']}</div>
            <div className="grid gap-2">
                {followed.map(actor => <div key={actor.uri}
                                            className="border rounded-lg p-3 flex-row-item-center justify-between">
                    <div className="min-w-0">
                        <div className="font-semibold truncate">{actor.name || actor.acct}</div>
                        <div className="text-sm text-secondary-foreground truncate">
                            @{actor.acct}
                            {/* a follow the other server has not answered yet is not a follow */}
                            {actor.state !== 'accepted' && ` · ${lang['Requested']}`}
                        </div>
                    </div>
                    <Button variant="secondary" disabled={busy} onClick={() => handleUnfollow(actor)}>
                        {lang['Unfollow']}
                    </Button>
                </div>)}
            </div>
        </div>}

        <div className="flex-row-item-center justify-between mb-2">
            <div className="font-semibold">{lang['Upcoming events']}</div>
            {signedIn && <div className="flex-row-item-center gap-1 text-xs">
                <button className={`px-2 py-1 rounded ${onlyMine ? '' : 'bg-secondary'}`}
                        onClick={() => setOnlyMine(false)}>{lang['All']}</button>
                <button className={`px-2 py-1 rounded ${onlyMine ? 'bg-secondary' : ''}`}
                        onClick={() => setOnlyMine(true)}>{lang['Mine']}</button>
            </div>}
        </div>
        {!shown.length && <div className="text-sm text-secondary-foreground py-8 text-center">
            {lang['No remote events yet — follow a community to see its events here']}
        </div>}

        <div className="grid gap-3">
            {shown.map(event => <FedEventCard
                key={event.id}
                lang={lang}
                event={event}
                status={statuses[event.id]}
                busy={busy}
                onJoin={() => handleJoin(event)}
                onLeave={() => handleLeave(event)}/>)}
        </div>
    </div>
}

function joinLabel(lang: Dictionary, mode: FedJoinMode, status?: string | null) {
    if (status === 'attending') return lang['Going']
    if (status === 'pending') return lang['Requested']
    if (status === 'rejected') return lang['Declined']
    if (mode === 'external') return lang['Register on the origin site']
    if (mode === 'invite') return lang['Invite only']
    return lang['Join']
}

function FedEventCard({lang, event, status, busy, onJoin, onLeave}: {
    lang: Dictionary
    event: FedEvent
    status?: string | null
    busy: boolean
    onJoin: () => void
    onLeave: () => void
}) {
    const cancelled = event.status === 'CANCELLED'
    const tz = event.timezone || undefined
    const start = event.start_time ? Dayjs(event.start_time).tz(tz) : null
    const joined = status === 'attending' || status === 'pending'
    const canAct = !cancelled && event.join_mode !== 'invite'

    return <div className="border rounded-lg p-4">
        <div className="flex-row-item-center justify-between gap-3">
            <div className="min-w-0">
                <div className="font-semibold truncate">
                    {cancelled && <span className="text-red-500 mr-1">{lang['Cancelled']}</span>}
                    {event.title}
                </div>
                <div className="text-sm text-secondary-foreground">
                    {start ? `${start.format('MMM D, YYYY HH:mm')} ${tz ? `(${tz})` : ''}` : ''}
                </div>
                {!!event.location?.name && <div className="text-sm text-secondary-foreground truncate">
                    {event.location.name}
                </div>}
                {/* where this came from — the whole point of a federated list */}
                <div className="text-xs text-secondary-foreground mt-1 truncate">
                    {lang['from']} @{event.origin?.acct || event.uri}
                </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
                {canAct && <Button
                    variant={joined ? 'secondary' : 'primary'}
                    disabled={busy || status === 'rejected'}
                    onClick={joined ? onLeave : onJoin}>
                    {joined && status === 'attending' ? lang['Leave'] : joinLabel(lang, event.join_mode, status)}
                </Button>}
                {!!event.max_participant && <div className="text-xs text-secondary-foreground">
                    {event.participant_count}/{event.max_participant}
                </div>}
            </div>
        </div>
    </div>
}
