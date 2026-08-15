'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {disableOauthApplication, OauthApplicationAdmin, setOauthApplicationReviewed} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {getAuth} from '@/utils'

export default function AdminOauthList({lang, applications, total, query}: {
    lang: Dictionary
    applications: OauthApplicationAdmin[]
    total: number
    query: string
}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const [search, setSearch] = useState(query)

    const run = async (fn: (authToken: string) => Promise<void>) => {
        const authToken = getAuth()
        if (!authToken) return
        const loading = showLoading()
        try {
            await fn(authToken)
            router.refresh()
        } catch (e: any) {
            toast({variant: 'destructive', title: e.message})
        } finally {
            closeModal(loading)
        }
    }

    const toggleReviewed = (app: OauthApplicationAdmin) => run(authToken =>
        setOauthApplicationReviewed({
            params: {id: app.id, reviewed: !app.reviewed, authToken},
            clientMode: CLIENT_MODE
        }).then(() => undefined)
    )

    const disable = (app: OauthApplicationAdmin) => showConfirmDialog({
        lang,
        title: app.name,
        content: lang['Disable this application? Every token it holds will be revoked.'],
        onConfig: () => run(authToken =>
            disableOauthApplication({params: {id: app.id, authToken}, clientMode: CLIENT_MODE})
                .then(() => undefined)
        )
    })

    return <div className="max-w-[860px] mx-auto">
        <div className="flex-row-item-center justify-between mb-4">
            <div className="text-xl font-semibold">{lang['OAuth Applications']} ({total})</div>
        </div>

        <form className="flex flex-row gap-2 mb-4" action="/admin/oauth">
            <Input name="q" value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="name / client_id"/>
            <Button type="submit" variant="secondary">{lang['Search']}</Button>
        </form>

        <div className="flex flex-col gap-3">
            {applications.map(app =>
                <div key={app.id} className="rounded-lg bg-[var(--background)] shadow p-4">
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold">
                            {app.name}
                            {app.trusted && <span className="ml-2 text-xs text-green-700">trusted</span>}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-gray-100">
                            {app.status === 'active' ? lang['Active']
                                : app.status === 'draft' ? lang['Draft'] : lang['Application disabled']}
                        </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 font-mono break-all">{app.client_id}</div>
                    <div className="mt-1 text-xs text-gray-400">
                        {lang['Provided by']} {app.owner_handle || app.owner_id}
                        {' · '}{lang['Active tokens']}: {app.active_token_count}
                        {' · '}{lang['Authorizations']}: {app.grant_count}
                    </div>
                    <div className="mt-1 text-xs text-gray-400 break-all">{app.redirect_uris.join(', ')}</div>
                    <div className="mt-1 text-xs text-gray-400">{app.allowed_scopes.join(' ')}</div>

                    <div className="flex flex-row flex-wrap gap-2 mt-3">
                        <Button variant="secondary" size="xs" onClick={() => toggleReviewed(app)}>
                            {app.reviewed ? lang['Unmark Reviewed'] : lang['Mark Reviewed']}
                        </Button>
                        {app.status !== 'disabled' &&
                            <Button variant="destructive" size="xs" onClick={() => disable(app)}>
                                {lang['Disable']}
                            </Button>}
                    </div>
                </div>
            )}
        </div>
    </div>
}
