'use client'

import {useRouter} from 'next/navigation'
import {useTransition, useState, ReactNode} from 'react'
import {buttonVariants} from '@/components/shadcn/Button'

export interface NavTabsProps {
    /** Query parameter these tabs write to. Ignored for tabs that give an
     *  explicit `href` — some tab bars are a set of sibling routes rather than
     *  one route with a parameter (see /my-events). */
    param?: string
    current: string
    tabs: {key: string, label: string, href?: string}[]
    /** Base path, e.g. `/profile/alice`. Defaults to the current path. */
    basePath?: string
    className?: string
    /** The active tab's panel, rendered on the server. Passed through so it can
     *  be dimmed while the next one is being fetched. */
    children?: ReactNode
}

/**
 * A tab bar whose panels are rendered on the server, one per URL.
 *
 * These used to be plain `<a href="?tab=…">`, which is a full document
 * navigation: the page went white, scroll jumped to the top, and every script
 * on it was parsed and hydrated again — to swap one panel. `router.push` does
 * the same thing as a soft navigation, so the browser keeps the document and
 * Next patches in just what changed.
 *
 * The server still renders only the tab that was asked for, so no other tab's
 * data is fetched. That is the difference from the event detail page, where
 * the panels are cheap enough to build together and switching is pure state:
 * here a tab can mean a list of every badge a user owns, and building all of
 * them to show one would be the more expensive mistake.
 *
 * A soft navigation is still a round-trip, so the clicked tab goes active
 * immediately and the panel below dims while the answer is on its way —
 * otherwise the first thing a click does is nothing, which reads as broken.
 */
export default function NavTabs({param = 'tab', current, tabs, basePath, className, children}: NavTabsProps) {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [optimistic, setOptimistic] = useState<string | null>(null)

    const active = pending && optimistic ? optimistic : current

    const hrefFor = (tab: {key: string, href?: string}) => {
        if (tab.href) return tab.href
        const url = new URL(basePath || window.location.pathname, window.location.origin)
        url.searchParams.set(param, tab.key)
        return url.pathname + url.search
    }

    const select = (tab: {key: string, href?: string}) => {
        if (tab.key === current) return
        setOptimistic(tab.key)
        startTransition(() => {
            // scroll: false — the tab bar is usually part-way down the page and
            // jumping to the top loses the reader's place.
            router.push(hrefFor(tab), {scroll: false})
        })
    }

    return <>
        <div className={`tab-titles flex-row-item-center overflow-auto ${className || ''}`} role="tablist">
            {tabs.map(t =>
                <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active === t.key}
                    onClick={() => select(t)}
                    className={`${buttonVariants({variant: active === t.key ? 'normal' : 'ghost'})} mr-3 shrink-0`}>
                    <span className="font-normal">{t.label}</span>
                </button>
            )}
        </div>
        {children !== undefined &&
            <div className={pending ? 'opacity-50 transition-opacity duration-200' : ''} aria-busy={pending}>
                {children}
            </div>
        }
    </>
}
