'use client'

import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {Category, GroupDetail, Topic, TopicCollection, getTopics} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import CardTopic from '@/components/CardTopic'

const PAGE_SIZE = 20

/**
 * The Discussion half of the event home's main column.
 *
 * Topics are fetched on the client rather than on the server with the events:
 * the tab is one of two, and most visitors open the page for the events. Doing
 * both server-side would put the cost of the forum on every event page view.
 */
export default function DiscussionPanel({lang, group, categories, canPost}: {
    lang: Dictionary,
    group: GroupDetail,
    categories: Category[],
    canPost: boolean
}) {
    const [topics, setTopics] = useState<Topic[]>([])
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const [collection, setCollection] = useState<TopicCollection>('latest')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        getTopics({
            params: {
                filters: {
                    group_id: group.id,
                    category_id: categoryId || undefined,
                    collection,
                    search: search || undefined,
                    page,
                    limit: PAGE_SIZE
                },
                authToken: getAuth()
            },
            clientMode: CLIENT_MODE
        }).then(res => {
            if (cancelled) return
            setTopics(prev => page === 1 ? res.data : [...prev, ...res.data])
            setHasMore(res.meta.page < res.meta.total_pages)
        }).catch(() => {
            // A 404 here means the feature or the group's switch is off. The
            // tab should not have rendered at all in that case, so there is
            // nothing useful to say — show the empty state.
            if (!cancelled) setTopics([])
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => { cancelled = true }
    }, [group.id, categoryId, collection, search, page])

    const reset = (fn: () => void) => { setPage(1); fn() }

    return <div className="my-3">
        <div className="flex-row-item-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex-row-item-center gap-2 overflow-x-auto">
                <CategoryChip active={categoryId === null} onClick={() => reset(() => setCategoryId(null))}>
                    {lang['All Boards']}
                </CategoryChip>
                {categories.map(category =>
                    <CategoryChip key={category.id}
                        active={categoryId === category.id}
                        onClick={() => reset(() => setCategoryId(category.id))}>
                        {category.name}
                        {/* Anyone who can see a private board already has access;
                            the lock is so the person about to post knows where
                            their words are going. */}
                        {category.visibility !== 'public' && <i className="uil-lock ml-1 text-xs"/>}
                    </CategoryChip>
                )}
            </div>

            {canPost &&
                <a href={`/event/${group.name}/discussion/create`}
                    className={`${buttonVariants({variant: 'special'})} shrink-0`}>
                    {lang['New Topic']}
                </a>
            }
        </div>

        <div className="flex-row-item-center gap-2 mb-3">
            <select className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                value={collection}
                onChange={e => reset(() => setCollection(e.target.value as TopicCollection))}>
                <option value="latest">{lang['Latest']}</option>
                <option value="newest">{lang['Newest']}</option>
                <option value="unanswered">{lang['Unanswered']}</option>
            </select>
            <input className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                placeholder={lang['Search']}
                defaultValue={search}
                onKeyDown={e => {
                    if (e.key === 'Enter') reset(() => setSearch((e.target as HTMLInputElement).value))
                }}/>
        </div>

        {!topics.length && !loading
            ? <div className="text-sm text-gray-400 py-16 text-center">
                <div>{lang['No topics yet']}</div>
                {canPost && <div className="mt-1">{lang['Be the first to post']}</div>}
            </div>
            : <div className="flex flex-col gap-3">
                {topics.map(topic =>
                    <CardTopic key={topic.id} topic={topic} lang={lang}
                        href={`/event/${group.name}/discussion/${topic.id}`}/>
                )}
            </div>
        }

        {hasMore &&
            <Button variant="secondary" className="w-full mt-3" disabled={loading}
                onClick={() => setPage(page + 1)}>
                {lang['Topics']}
            </Button>
        }
    </div>
}

function CategoryChip({active, onClick, children}: {
    active: boolean,
    onClick: () => void,
    children: React.ReactNode
}) {
    return <button onClick={onClick}
        className={`shrink-0 text-sm rounded-full px-3 py-1 border duration-200 ${
            active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}>
        {children}
    </button>
}
