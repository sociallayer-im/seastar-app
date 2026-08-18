'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {
    createOauthApplication,
    OauthApplication,
    OauthApplicationDraft,
    removeOauthApplication,
    rotateOauthSecret,
    updateOauthApplication
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {Textarea} from '@/components/shadcn/Textarea'
import {Checkbox} from '@/components/shadcn/Checkbox'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import CopyText from '@/components/client/CopyText'
import {getAuth} from '@/utils'

// Kept in step with OauthApplication::VALID_SCOPES. A scope missing here is
// simply unofferable in the UI; one that does not exist server-side is a 422.
const SCOPES = [
    'openid', 'profile', 'email', 'phone', 'wallet',
    'groups:read', 'events:read', 'badges:read', 'tickets:read'
]
const SENSITIVE_SCOPES = ['tickets:read']

const emptyDraft = (): OauthApplicationDraft => ({
    name: '', description: '', homepage_url: '', logo_url: '',
    redirect_uris: [], allowed_scopes: ['openid', 'profile'], confidential: true
})

export default function OauthApps({lang, applications}: {lang: Dictionary, applications: OauthApplication[]}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()

    const [creating, setCreating] = useState(false)
    const [draft, setDraft] = useState<OauthApplicationDraft>(emptyDraft())
    // Held in state, never re-fetched: the API returns a secret exactly once,
    // on create and on rotate. Navigating away loses it for good.
    const [secret, setSecret] = useState<{id: string, value: string} | null>(null)

    const withAuth = async (fn: (authToken: string) => Promise<void>) => {
        const authToken = getAuth()
        if (!authToken) {
            window.location.href = '/signin'
            return
        }
        const loading = showLoading()
        try {
            await fn(authToken)
        } catch (e: any) {
            toast({variant: 'destructive', title: e.message})
        } finally {
            closeModal(loading)
        }
    }

    const submit = () => withAuth(async authToken => {
        const created = await createOauthApplication({
            params: {
                application: {
                    ...draft,
                    redirect_uris: draft.redirect_uris.filter(Boolean)
                },
                authToken
            },
            clientMode: CLIENT_MODE
        })
        if (created.client_secret) setSecret({id: created.id, value: created.client_secret})
        setCreating(false)
        setDraft(emptyDraft())
        router.refresh()
    })

    const setStatus = (app: OauthApplication, status: 'draft' | 'active' | 'disabled') =>
        withAuth(async authToken => {
            await updateOauthApplication({
                params: {id: app.id, application: {status}, authToken},
                clientMode: CLIENT_MODE
            })
            router.refresh()
        })

    const rotate = (app: OauthApplication) => showConfirmDialog({
        lang,
        title: lang['Rotate Secret'],
        content: lang['Rotating the secret will break any deployment still using the old one. Continue?'],
        onConfig: () => withAuth(async authToken => {
            const updated = await rotateOauthSecret({params: {id: app.id, authToken}, clientMode: CLIENT_MODE})
            if (updated.client_secret) setSecret({id: app.id, value: updated.client_secret})
        })
    })

    const remove = (app: OauthApplication) => showConfirmDialog({
        lang,
        title: app.name,
        content: lang['Delete this application? Every user session it holds will end.'],
        onConfig: () => withAuth(async authToken => {
            await removeOauthApplication({params: {id: app.id, authToken}, clientMode: CLIENT_MODE})
            router.refresh()
        })
    })

    const toggleScope = (scope: string) => setDraft(d => ({
        ...d,
        allowed_scopes: d.allowed_scopes.includes(scope)
            ? d.allowed_scopes.filter(s => s !== scope)
            : [...d.allowed_scopes, scope]
    }))

    return <div className="max-w-[720px] mx-auto">
        <div className="flex-row-item-center justify-between mb-4">
            <div className="text-xl font-semibold">{lang['OAuth Applications']}</div>
            {!creating &&
                <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
                    {lang['Create Application']}
                </Button>}
        </div>

        {!!secret &&
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <div className="text-sm font-semibold">{lang['Client Secret']}</div>
                <div className="text-xs text-amber-700 mb-2">{lang['Copy it now — it will not be shown again.']}</div>
                <CopyText value={secret.value}
                          className="font-mono text-xs break-all cursor-pointer bg-white rounded-sm p-2">
                    {secret.value}
                </CopyText>
            </div>}

        {creating &&
            <div className="mb-6 rounded-lg bg-(--background) shadow-sm p-4 flex flex-col gap-3">
                <label className="text-sm font-medium">{lang['Application Name']}</label>
                <Input value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})}/>

                <label className="text-sm font-medium">{lang['Description']}</label>
                <Textarea value={draft.description}
                          onChange={e => setDraft({...draft, description: e.target.value})}/>

                <label className="text-sm font-medium">{lang['Homepage URL']}</label>
                <Input value={draft.homepage_url}
                       onChange={e => setDraft({...draft, homepage_url: e.target.value})}/>

                <label className="text-sm font-medium">{lang['Logo URL']}</label>
                <Input value={draft.logo_url} onChange={e => setDraft({...draft, logo_url: e.target.value})}/>

                <label className="text-sm font-medium">{lang['Redirect URIs']}</label>
                <Textarea value={draft.redirect_uris.join('\n')}
                          onChange={e => setDraft({...draft, redirect_uris: e.target.value.split('\n')})}/>
                <div className="text-xs text-gray-400">
                    {lang['One per line. Must be https, or http on localhost.']}
                </div>

                <label className="text-sm font-medium">{lang['Requested Scopes']}</label>
                <div className="flex flex-row flex-wrap gap-3">
                    {SCOPES.map(scope =>
                        <label key={scope} className="flex-row-item-center gap-1 text-sm cursor-pointer">
                            <Checkbox checked={draft.allowed_scopes.includes(scope)}
                                      onCheckedChange={() => toggleScope(scope)}/>
                            <span className={SENSITIVE_SCOPES.includes(scope) ? 'text-amber-700 font-medium' : ''}>
                                {scope}
                            </span>
                        </label>
                    )}
                </div>

                <label className="flex-row-item-center gap-2 text-sm cursor-pointer mt-2">
                    <Checkbox checked={draft.confidential === false}
                              onCheckedChange={checked => setDraft({...draft, confidential: !checked})}/>
                    {lang['Public client (no secret, PKCE only)']}
                </label>

                <div className="flex flex-row gap-2 mt-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setCreating(false)}>
                        {lang['Cancel']}
                    </Button>
                    <Button variant="primary" className="flex-1" disabled={!draft.name} onClick={submit}>
                        {lang['Create Application']}
                    </Button>
                </div>
            </div>}

        {!applications.length && !creating &&
            <div className="text-sm text-gray-400 py-12 text-center">{lang['No applications yet']}</div>}

        <div className="flex flex-col gap-3">
            {applications.map(app =>
                <div key={app.id} className="rounded-lg bg-(--background) shadow-sm p-4">
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold">{app.name}</div>
                        <div className="text-xs px-2 py-1 rounded-sm bg-gray-100">
                            {app.status === 'active' ? lang['Active']
                                : app.status === 'draft' ? lang['Draft'] : lang['Application disabled']}
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 font-mono break-all">{app.client_id}</div>
                    <div className="mt-1 text-xs text-gray-400 break-all">{app.redirect_uris.join(', ')}</div>
                    <div className="mt-1 text-xs text-gray-400">{app.allowed_scopes.join(' ')}</div>

                    <div className="flex flex-row flex-wrap gap-2 mt-3">
                        {app.status !== 'active' &&
                            <Button variant="primary" size="xs" onClick={() => setStatus(app, 'active')}>
                                {lang['Active']}
                            </Button>}
                        {app.status === 'active' &&
                            <Button variant="secondary" size="xs" onClick={() => setStatus(app, 'draft')}>
                                {lang['Draft']}
                            </Button>}
                        {app.confidential &&
                            <Button variant="secondary" size="xs" onClick={() => rotate(app)}>
                                {lang['Rotate Secret']}
                            </Button>}
                        <Button variant="destructive" size="xs" onClick={() => remove(app)}>
                            {lang['Remove']}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    </div>
}
