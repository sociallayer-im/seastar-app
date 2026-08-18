'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {Category, GroupDetail, createTopic} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export default function TopicCreateForm({lang, group, categories}: {
    lang: Dictionary,
    group: GroupDetail,
    categories: Category[]
}) {
    const router = useRouter()
    const {toast} = useToast()

    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)

    const selected = categories.find(c => c.id === categoryId)

    // Which audience a private board actually means, spelled out. The single
    // most common mistake on a forum with mixed visibility is believing you
    // are somewhere private when you are not, or the reverse.
    const audience = selected?.visibility === 'member' ? lang['Members of this group']
        : selected?.visibility === 'manager' ? lang['Managers of this group']
        : selected?.visibility === 'invited' ? lang['Invited people only']
        : null

    const submit = async () => {
        const authToken = getAuth()
        if (!authToken) {
            router.push(`/signin?return=/event/${group.name}/discussion/create`)
            return
        }
        if (!title.trim() || !categoryId) return

        setSaving(true)
        try {
            const topic = await createTopic({
                params: {draft: {category_id: categoryId, title, content}, authToken},
                clientMode: CLIENT_MODE
            })
            router.refresh()
            router.push(`/event/${group.name}/discussion/${topic.id}`)
        } catch (e: unknown) {
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed'})
        } finally {
            setSaving(false)
        }
    }

    if (!categories.length) {
        return <div className="max-w-[560px] mx-auto text-center py-16 text-gray-400">
            {lang['No topics yet']}
        </div>
    }

    return <div className="max-w-[560px] mx-auto">
        <div className="text-xl font-semibold mb-4">{lang['New Topic']}</div>

        <label className="text-sm text-gray-500">{lang['Board']}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c =>
                <option key={c.id} value={c.id}>
                    {c.name}{c.visibility !== 'public' ? ' 🔒' : ''}
                </option>
            )}
        </select>
        {!!audience &&
            <div className="text-xs text-gray-500 mt-1">
                {lang['Only visible to {1}'].replace('{1}', audience)}
            </div>
        }

        <label className="text-sm text-gray-500 block mt-4">{lang['Topic Title']}</label>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            maxLength={200}
            value={title}
            onChange={e => setTitle(e.target.value)}/>

        <label className="text-sm text-gray-500 block mt-4">{lang['Topic Body']}</label>
        <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[200px] mt-1"
            value={content}
            onChange={e => setContent(e.target.value)}/>

        <Button variant="special" className="mt-4" disabled={saving || !title.trim()} onClick={submit}>
            {lang['Post Topic']}
        </Button>
    </div>
}
