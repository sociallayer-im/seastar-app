'use client'

import {useCallback, useEffect, useState} from 'react'

/**
 * A tab selection that lives in the URL, for tabs whose content is already in
 * the browser.
 *
 * Use this when switching tabs needs no new data — the panels were rendered or
 * fetched together and the choice is purely which one to show. It keeps the
 * switch instant (plain state, no navigation) while still making each tab
 * linkable and reachable with the back button. For tabs whose panel is
 * rendered on the server per URL, use NavTabs instead: this hook deliberately
 * does not tell Next about the change, so a server component would not
 * re-render.
 *
 * `key` is the query parameter to use. Nested tab bars must each pick their
 * own — a sub-tab writing to `tab` would fight the page-level tabs for it.
 *
 * @param key query parameter name, e.g. 'tab'
 * @param values the allowed values, first one is the default
 */
export default function useTabParam<T extends string>(key: string, values: readonly T[]): [T, (next: T) => void] {
    // A URL can name a tab that isn't on offer — an old link, or a tab this
    // viewer doesn't get to see.
    const resolve = useCallback((value?: string | null): T =>
        values.includes(value as T) ? value as T : values[0]
    , [values.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

    // Read on mount rather than during render: the server has no location, and
    // reading it while rendering would make the first client render disagree
    // with the server's HTML.
    const [tab, setTab] = useState<T>(() => values[0])

    useEffect(() => {
        const fromUrl = () => setTab(resolve(new URLSearchParams(window.location.search).get(key)))
        fromUrl()
        window.addEventListener('popstate', fromUrl)
        return () => window.removeEventListener('popstate', fromUrl)
    }, [key, resolve])

    const select = useCallback((next: T) => {
        setTab(next)
        const url = new URL(window.location.href)
        url.searchParams.set(key, next)
        window.history.pushState(null, '', url)
    }, [key])

    return [tab, select]
}
