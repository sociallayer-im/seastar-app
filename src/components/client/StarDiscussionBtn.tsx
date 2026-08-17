'use client'

import {MouseEvent, useState} from 'react'
import {getAuth} from '@/utils'
import {starDiscussionItem, unstarDiscussionItem} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'

/**
 * Star a topic or a reply, with the count beside it.
 *
 * Unlike StarEventBtn this renders for signed-out visitors too. The count is
 * public information and a card that shows "12" to one person and nothing to
 * another reads as a bug; clicking simply sends them to sign in.
 *
 * The count is adjusted optimistically and rolled back if the request fails.
 * The server recomputes it from the comments table either way, so a refresh
 * always shows the truth — the local number only has to be right until then.
 */
export default function StarDiscussionBtn({itemType, itemId, starred, count, size = 'normal', className}: {
    itemType: 'Topic' | 'Reply',
    itemId: string,
    starred: boolean,
    count: number,
    size?: 'normal' | 'small',
    className?: string
}) {
    const [isStarred, setIsStarred] = useState(starred)
    const [total, setTotal] = useState(count)
    const [busy, setBusy] = useState(false)
    const {toast} = useToast()

    const toggle = async (e: MouseEvent) => {
        // The topic card is itself a link; starring must not open it.
        e.preventDefault()
        e.stopPropagation()

        const authToken = getAuth()
        if (!authToken) {
            window.location.href = `/signin?return=${encodeURIComponent(window.location.pathname)}`
            return
        }
        if (busy) return

        const next = !isStarred
        setIsStarred(next)
        setTotal(total + (next ? 1 : -1))
        setBusy(true)
        try {
            const fn = next ? starDiscussionItem : unstarDiscussionItem
            await fn({params: {itemType, itemId, authToken}, clientMode: CLIENT_MODE})
        } catch (err: unknown) {
            setIsStarred(!next)
            setTotal(total)
            toast({variant: 'destructive',
                title: err instanceof Error ? err.message : 'Failed'})
        } finally {
            setBusy(false)
        }
    }

    const text = size === 'small' ? 'text-xs' : 'text-sm'

    return <button onClick={toggle}
        aria-pressed={isStarred}
        className={`flex-row-item-center gap-1 ${text} duration-200 ${
            isStarred ? 'text-[#F1CB45]' : 'text-gray-400 hover:text-gray-600'} ${className || ''}`}>
        <i className={isStarred ? 'uil-favorite' : 'uil-star'}/>
        {total > 0 && <span>{total}</span>}
    </button>
}
