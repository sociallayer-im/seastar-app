'use client'

import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {useEffect, useState} from 'react'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {
    StripeSetting,
    getStripeSettings,
    createStripeSetting,
    removeStripeSetting
} from '@sola/sdk'

/**
 * Personal-settings manager for the user's Stripe API keys (multiple keys
 * per user; PAYMENTS_PLAN decision #14). The backend only ever returns the
 * masked tail — the full key exists client-side solely in the add form.
 */
export default function StripeKeysManager({lang}: { lang: Dictionary }) {
    const {toast} = useToast()
    const [settings, setSettings] = useState<StripeSetting[]>([])
    const [loaded, setLoaded] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [busy, setBusy] = useState(false)

    const load = async () => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            setSettings(await getStripeSettings({params: {authToken}, clientMode: CLIENT_MODE}))
        } catch (e) {
            // Backend without STRIPE_ENABLED 404s — just render nothing useful.
            console.error(e)
        } finally {
            setLoaded(true)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleAdd = async () => {
        if (!name.trim() || !secretKey.trim()) return
        // Pasting the publishable key here is the easiest mistake to make —
        // it can't charge cards, and Stripe would just answer 401.
        if (secretKey.trim().startsWith('pk_')) {
            toast({description: lang['Publishable key error'], variant: 'destructive'})
            return
        }
        const authToken = getAuth()
        if (!authToken) return
        setBusy(true)
        try {
            await createStripeSetting({
                params: {name: name.trim(), secretKey: secretKey.trim(), authToken},
                clientMode: CLIENT_MODE
            })
            setName('')
            setSecretKey('')
            setShowForm(false)
            await load()
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Failed to add key',
                variant: 'destructive'
            })
        } finally {
            setBusy(false)
        }
    }

    const handleRemove = async (setting: StripeSetting) => {
        if (!window.confirm(`${lang['Remove Key']}: ${setting.name} (${setting.masked_key})?`)) return
        const authToken = getAuth()
        if (!authToken) return
        try {
            await removeStripeSetting({params: {settingId: setting.id, authToken}, clientMode: CLIENT_MODE})
            await load()
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Failed to remove key',
                variant: 'destructive'
            })
        }
    }

    if (!loaded) return null

    return <div className="mt-6">
        <div className="font-semibold pb-2">{lang['Stripe Payment Keys']}</div>
        <div className="text-xs text-gray-500 mb-3">{lang['Stripe keys intro']}</div>

        {settings.map(s => (
            <div key={s.id} className="flex-row-item-center justify-between border border-gray-200 rounded-lg p-3 mb-2">
                <div>
                    <div className="flex-row-item-center text-sm font-semibold">
                        <span>{s.name}</span>
                        <span className="ml-2 text-gray-400 font-normal">{s.masked_key}</span>
                        {s.mode === 'test' &&
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700">{lang['TEST MODE']}</span>}
                        {s.status === 'invalid' &&
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700">invalid</span>}
                        {s.delayed_confirmation &&
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-500">{lang['Delayed confirmation']}</span>}
                    </div>
                    {!!s.account_id && <div className="text-xs text-gray-400 mt-1">{s.account_id}</div>}
                </div>
                <Button variant={'ghost'} size={'sm'} onClick={() => handleRemove(s)}>
                    <i className="uil-trash-alt text-lg"/>
                </Button>
            </div>
        ))}

        {showForm
            ? <div className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm mb-1">{lang['Key Name']}</div>
                <Input inputSize={'md'} className="w-full mb-2" value={name}
                    onChange={e => setName(e.target.value)}/>
                <div className="text-sm mb-1">{lang['Secret Key']}</div>
                <Input inputSize={'md'} className="w-full" value={secretKey}
                    placeholder="rk_live_… / sk_live_…"
                    onChange={e => setSecretKey(e.target.value)}/>
                <div className="text-xs text-gray-400 mt-1 mb-3">{lang['Secret key hint']}</div>
                <div className="flex-row-item-center">
                    <Button variant={'primary'} size={'sm'} disabled={busy} onClick={handleAdd}>
                        {lang['Add Key']}
                    </Button>
                    <Button variant={'secondary'} size={'sm'} className="ml-2" onClick={() => setShowForm(false)}>
                        {lang['Cancel']}
                    </Button>
                </div>
            </div>
            : <Button variant={'secondary'} size={'sm'} onClick={() => setShowForm(true)}>
                <i className="uil-plus mr-1"/>{lang['Add Key']}
            </Button>
        }
    </div>
}
