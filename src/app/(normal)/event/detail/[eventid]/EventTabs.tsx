'use client'

import {ReactNode, useCallback, useEffect, useRef, useState} from 'react'

export type EventTabKey = 'content' | 'tickets' | 'participants'

const SWITCH_EVENT = 'sola:event-tab'

/**
 * Switch the event detail tabs from elsewhere on the page.
 *
 * A window event rather than a context: the callers sit above the tab bar in
 * the server-rendered header, so a provider would have to wrap most of the
 * page to reach both ends. Nothing happens if the tab bar isn't mounted, which
 * is the right outcome on the pages that don't have one.
 */
export const goToEventTab = (tab: EventTabKey) => {
    window.dispatchEvent(new CustomEvent(SWITCH_EVENT, {detail: tab}))
}

export interface EventTabsProps {
    initialTab: string
    tabs: {
        key: EventTabKey
        label: string
        count?: number
        panel: ReactNode
    }[]
}

/**
 * The event detail tab bar.
 *
 * Switching used to be `<a href="?tab=…">`, i.e. a full document navigation:
 * white flash, scroll jumped to the top, every client component remounted, and
 * the server re-ran the whole of `data.ts`. That last part was pure waste —
 * `data.ts` never branched on `tab`, so the event, its participants and (for an
 * organizer) every order were already fetched and already in this page's
 * payload. The navigation went and fetched them a second time to show a subset
 * of what the browser was holding.
 *
 * So the panels are rendered on the server as before and handed here as nodes;
 * switching is local state and costs nothing.
 *
 * Two details worth keeping:
 *
 * - A panel is mounted on first view and then kept mounted, hidden. Mounting
 *   lazily keeps the comment thread from fetching for someone who opened the
 *   Participants tab; keeping it mounted means going back to a tab restores it
 *   as it was — scroll position, the Participants/Orders sub-tab, an open form.
 * - The URL still changes, via `history.pushState`, so a tab stays linkable and
 *   the back button steps through tabs the way it did when these were links.
 *   `pushState` alone doesn't tell React anything, hence the popstate listener.
 */
export default function EventTabs({initialTab, tabs}: EventTabsProps) {
    const keys = tabs.map(t => t.key)
    // A URL can name a tab this viewer doesn't have — ?tab=participants on an
    // event whose participant list is organizer-only, say.
    const resolve = useCallback((value?: string | null): EventTabKey =>
        keys.includes(value as EventTabKey) ? value as EventTabKey : keys[0]
    , [keys.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

    const [tab, setTab] = useState<EventTabKey>(() => resolve(initialTab))
    const [mounted, setMounted] = useState<EventTabKey[]>(() => [resolve(initialTab)])

    const show = useCallback((next: EventTabKey) => {
        setTab(next)
        setMounted(prev => prev.includes(next) ? prev : [...prev, next])
    }, [])

    const barRef = useRef<HTMLDivElement>(null)

    const select = useCallback((next: EventTabKey, scroll = false) => {
        show(next)
        const url = new URL(window.location.href)
        url.searchParams.set('tab', next)
        window.history.pushState(null, '', url)
        // Only when something off-screen sent us here: the tab bar can sit
        // below the fold on a phone, and switching to a tab you can't see is
        // indistinguishable from the button doing nothing.
        if (scroll) barRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'})
    }, [show])

    useEffect(() => {
        const onPop = () => {
            const fromUrl = new URLSearchParams(window.location.search).get('tab')
            show(resolve(fromUrl))
        }
        const onSwitch = (e: Event) => {
            select(resolve((e as CustomEvent).detail), true)
        }
        window.addEventListener('popstate', onPop)
        window.addEventListener(SWITCH_EVENT, onSwitch)
        return () => {
            window.removeEventListener('popstate', onPop)
            window.removeEventListener(SWITCH_EVENT, onSwitch)
        }
    }, [resolve, show, select])

    return <>
        {/* One row at every width. This was `grid grid-cols-2` on mobile, so a
            third tab wrapped onto a second line and its underline — absolutely
            positioned at bottom-0 — landed on top of whatever followed. Three
            tabs still fit at 320px. */}
        <div ref={barRef} className="flex font-semibold mt-6 scroll-mt-4" role="tablist">
            {tabs.map((item, index) =>
                <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.key}
                    onClick={() => item.key !== tab && select(item.key)}
                    className={`flex-1 min-w-0 text-center cursor-pointer text-sm sm:text-base py-1 px-1 sm:px-2
                        relative whitespace-nowrap ${index > 0 ? 'border-l border-gray-200' : ''}`}>
                    <span className="relative z-10">
                        {item.label}
                        {!!item.count && <span className="text-xs ml-0.5">({item.count})</span>}
                    </span>
                    {tab === item.key &&
                        <img width={90} height={12} alt=""
                            className="w-[64px] sm:w-[80px] absolute left-1/2 -translate-x-1/2 bottom-0"
                            src="/images/tab_bg.png"/>
                    }
                </button>
            )}
        </div>

        {tabs.filter(item => mounted.includes(item.key)).map(item =>
            <div key={item.key} className={tab === item.key ? '' : 'hidden'}>
                {item.panel}
            </div>
        )}
    </>
}
