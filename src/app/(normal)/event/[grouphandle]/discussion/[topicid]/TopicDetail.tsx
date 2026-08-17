'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {
    GroupDetail, Profile, Reply, TopicDetail as TopicDetailType,
    createReply, deleteReply, deleteTopic, replyAction, topicAction
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Badge} from '@/components/shadcn/Badge'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import Avatar from '@/components/Avatar'
import StarDiscussionBtn from '@/components/client/StarDiscussionBtn'
import dynamic from 'next/dynamic'

const DynamicLocalTime = dynamic(() => import('@/components/client/LocalTime'), {ssr: false})

/**
 * One thread: the post, then its floors in the order they were written.
 *
 * Flat by design — `reply_to` renders as a quote line above a reply, and
 * clicking it jumps to the floor it names. It never nests, and it is never
 * followed more than one level: a chain of quotes is unbounded work to render
 * and unbounded height to read.
 */
export default function TopicDetail({lang, groupDetail, topic, replies: initialReplies, currProfile}: {
    lang: Dictionary,
    groupDetail: GroupDetail,
    topic: TopicDetailType,
    replies: Reply[],
    currProfile: Profile | null
}) {
    const router = useRouter()
    const {toast} = useToast()

    const [replies, setReplies] = useState(initialReplies)
    const [content, setContent] = useState('')
    const [replyTo, setReplyTo] = useState<Reply | null>(null)
    const [sending, setSending] = useState(false)

    const authToken = () => getAuth()

    const submit = async () => {
        const token = authToken()
        if (!token) {
            window.location.href = `/signin?return=/event/${groupDetail.name}/discussion/${topic.id}`
            return
        }
        if (!content.trim()) return

        setSending(true)
        try {
            const reply = await createReply({
                params: {topicId: topic.id, content, replyToId: replyTo?.id ?? null, authToken: token},
                clientMode: CLIENT_MODE
            })
            setReplies([...replies, reply])
            setContent('')
            setReplyTo(null)
        } catch (e: unknown) {
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed'})
        } finally {
            setSending(false)
        }
    }

    const runTopicAction = async (action: 'pin' | 'unpin' | 'close' | 'open' | 'flag' | 'unflag') => {
        const token = authToken()
        if (!token) return
        // The reason is what makes hiding explainable to the person hidden;
        // asking for it at the moment of hiding is the only time it is cheap.
        const reason = action === 'flag'
            ? (window.prompt(lang['Reason (optional)']) ?? undefined)
            : undefined
        await run(
            () => topicAction({params: {topicId: topic.id, action, reason, authToken: token},
                clientMode: CLIENT_MODE}),
            () => router.refresh()
        )
    }

    // Every mutating action goes through this. Without it a refused delete or
    // hide simply did nothing visible — no redirect, no message, and an
    // unhandled rejection in the console.
    const run = async (fn: () => Promise<unknown>, after?: () => void) => {
        try {
            await fn()
            after?.()
        } catch (e: unknown) {
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed'})
        }
    }

    const removeTopic = async () => {
        const token = authToken()
        if (!token || !window.confirm(lang['Delete this permanently?'])) return
        await run(
            () => deleteTopic({params: {topicId: topic.id, authToken: token}, clientMode: CLIENT_MODE}),
            () => router.push(`/event/${groupDetail.name}?tab=discussion`)
        )
    }

    const removeReply = async (reply: Reply) => {
        const token = authToken()
        if (!token || !window.confirm(lang['Delete this permanently?'])) return
        await run(
            () => deleteReply({params: {replyId: reply.id, authToken: token}, clientMode: CLIENT_MODE}),
            () => setReplies(replies.filter(r => r.id !== reply.id))
        )
    }

    const hideReply = async (reply: Reply) => {
        const token = authToken()
        if (!token) return
        const reason = window.prompt(lang['Reason (optional)']) ?? undefined
        await run(
            () => replyAction({params: {replyId: reply.id, action: 'flag', reason, authToken: token},
                clientMode: CLIENT_MODE}),
            () => router.refresh()
        )
    }

    return <div className="max-w-[720px] mx-auto">
        <a className="text-sm text-blue-500 underline" href={`/event/${groupDetail.name}?tab=discussion`}>
            ← {lang['Discussion']}
        </a>

        <div className="flex-row-item-center flex-wrap gap-1 mt-3">
            {topic.pinned && <Badge variant="upcoming">{lang['Pinned']}</Badge>}
            {topic.closed && <Badge variant="past">{lang['Locked']}</Badge>}
            {topic.flagged && <Badge variant="private">{lang['Hidden']}</Badge>}
            <span className="text-xs text-gray-500 flex-row-item-center gap-1">
                {topic.category.name}
                {topic.category.visibility !== 'public' && <i className="uil-lock"/>}
            </span>
        </div>

        <h1 className="text-2xl font-semibold mt-2">{topic.title}</h1>

        <div className="flex-row-item-center gap-2 mt-2 text-sm text-gray-500">
            <Avatar profile={topic.user} size={20}/>
            <span>{topic.user?.nickname || topic.user?.name}</span>
            <span>·</span>
            <span><DynamicLocalTime value={topic.created_at}/></span>
            <StarDiscussionBtn className="ml-auto" itemType="Topic" itemId={topic.id}
                starred={topic.is_starred} count={topic.stars_count}/>
        </div>

        {/* The author is told, in words, that their post is hidden and why.
            A post that silently disappears is where moderation disputes start. */}
        {topic.flagged &&
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                {lang['This topic is hidden']}
                {!!topic.flag_reason && <div className="mt-1 text-xs">{topic.flag_reason}</div>}
            </div>
        }

        {!!topic.content &&
            <div className="text-sm mt-4 whitespace-pre-wrap leading-6">{topic.content}</div>}

        {topic.can_manage &&
            <div className="flex-row-item-center gap-2 mt-4 flex-wrap">
                <Button variant="secondary" onClick={() => runTopicAction(topic.pinned ? 'unpin' : 'pin')}>
                    {topic.pinned ? lang['Unpin'] : lang['Pin']}
                </Button>
                <Button variant="secondary" onClick={() => runTopicAction(topic.closed ? 'open' : 'close')}>
                    {topic.closed ? lang['Unlock'] : lang['Lock']}
                </Button>
                <Button variant="secondary" onClick={() => runTopicAction(topic.flagged ? 'unflag' : 'flag')}>
                    {topic.flagged ? lang['Unhide'] : lang['Hide']}
                </Button>
            </div>
        }
        {topic.can_edit && !topic.can_manage &&
            <div className="flex-row-item-center gap-2 mt-4">
                <Button variant="secondary" onClick={removeTopic}>{lang['Delete']}</Button>
            </div>
        }

        <div className="text-sm font-semibold mt-8 mb-3">
            {replies.length} {lang['Replies']}
        </div>

        {!replies.length
            ? <div className="text-sm text-gray-400 py-8 text-center">{lang['No replies yet']}</div>
            : <div className="flex flex-col gap-4">
                {replies.map(reply =>
                    <div key={reply.id} id={`reply-${reply.id}`} className="border-b border-gray-100 pb-3">
                        <div className="flex-row-item-center gap-2 text-sm">
                            <Avatar profile={reply.user} size={20}/>
                            <span className="font-semibold">{reply.user?.nickname || reply.user?.name}</span>
                            <span className="text-xs text-gray-400 ml-auto">
                                <DynamicLocalTime value={reply.created_at}/>
                            </span>
                        </div>

                        {/* One level up, never a chain. A quoted reply that has
                            been hidden or removed shows a tombstone — the
                            conversation still has to read correctly without it. */}
                        {!!reply.reply_to &&
                            <a href={`#reply-${reply.reply_to.id}`}
                                className="block text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 mt-2">
                                {lang['In reply to']} {reply.reply_to.user?.nickname || reply.reply_to.user?.name}
                                {': '}
                                {reply.reply_to.state === 'flagged'
                                    ? <span className="italic">{lang['Reply hidden']}</span>
                                    : (reply.reply_to.excerpt || <span className="italic">{lang['Reply deleted']}</span>)}
                            </a>
                        }

                        {reply.flagged &&
                            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                                {lang['This reply is hidden']}
                                {!!reply.flag_reason && <span> — {reply.flag_reason}</span>}
                            </div>
                        }

                        <div className="text-sm mt-2 whitespace-pre-wrap">{reply.content}</div>

                        <div className="flex-row-item-center gap-3 mt-2 text-xs text-gray-400">
                            <StarDiscussionBtn itemType="Reply" itemId={reply.id} size="small"
                                starred={reply.is_starred} count={reply.stars_count}/>
                            {!topic.closed &&
                                <button onClick={() => setReplyTo(reply)}>{lang['Reply']}</button>}
                            {reply.can_edit &&
                                <button onClick={() => removeReply(reply)}>{lang['Delete']}</button>}
                            {topic.can_manage && !reply.flagged &&
                                <button onClick={() => hideReply(reply)}>{lang['Hide']}</button>}
                        </div>
                    </div>
                )}
            </div>
        }

        <div className="mt-6">
            {topic.closed
                ? <div className="text-sm text-gray-400 text-center py-4">{lang['This topic is locked']}</div>
                : !currProfile
                    ? <a className="block text-sm text-blue-500 underline text-center py-4"
                        href={`/signin?return=/event/${groupDetail.name}/discussion/${topic.id}`}>
                        {lang['Sign in to post']}
                    </a>
                    : <>
                        {!!replyTo &&
                            <div className="flex-row-item-center justify-between text-xs bg-gray-50 rounded px-2 py-1 mb-2">
                                <span>
                                    {lang['In reply to']} {replyTo.user?.nickname || replyTo.user?.name}
                                </span>
                                <button className="text-gray-400" onClick={() => setReplyTo(null)}>✕</button>
                            </div>
                        }
                        <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[100px]"
                            placeholder={lang['Write a reply']}
                            value={content}
                            onChange={e => setContent(e.target.value)}/>
                        <Button variant="special" className="mt-2" disabled={sending || !content.trim()}
                            onClick={submit}>
                            {lang['Reply']}
                        </Button>
                    </>
            }
        </div>
    </div>
}
