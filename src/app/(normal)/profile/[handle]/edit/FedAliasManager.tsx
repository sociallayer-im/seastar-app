'use client'

import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {addMyFedAlias, FedAliases, getMyFedAliases, removeMyFedAlias} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'

/**
 * Declaring a former identity (alsoKnownAs) is the *receiving* half of an
 * account migration: when the old account elsewhere announces its Move, peers
 * only honour it if this account independently claims the old id — verified on
 * a fresh fetch, which is what stops anyone from capturing someone else's
 * followers by pointing a Move at them.
 *
 * Loads by token, not by the handle in the URL: the edit route has no owner
 * guard, and these are the viewer's own aliases either way.
 */
export default function FedAliasManager({lang}: {lang: Dictionary}) {
    const [aliases, setAliases] = useState<FedAliases | null>(null)
    const [input, setInput] = useState('')
    const [busy, setBusy] = useState(false)
    const {toast} = useToast()

    const load = async () => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            setAliases(await getMyFedAliases({params: {authToken}, clientMode: CLIENT_MODE}))
        } catch (e: unknown) {
            console.error('[FedAliasManager]: ', e)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const run = async (fn: () => Promise<unknown>, successMsg: string) => {
        setBusy(true)
        try {
            await fn()
            toast({description: successMsg})
            await load()
        } catch (e: unknown) {
            toast({description: e instanceof Error ? e.message : 'Failed', variant: 'destructive'})
        } finally {
            setBusy(false)
        }
    }

    if (!aliases) return null

    return <div className="mt-6">
        <div className="font-semibold pb-2">{lang['Former Identities']}</div>
        <div className="text-xs text-gray-500 mb-3">{lang['Alias intro']}</div>

        <div className="border border-gray-200 rounded-lg p-3 mb-3">
            <div className="text-xs text-gray-500 mb-1">{lang['This account\'s ActivityPub id']}</div>
            <div className="font-mono text-xs break-all">{aliases.actor_uri}</div>
        </div>

        {aliases.also_known_as.map(uri =>
            <div key={uri} className="flex-row-item-center justify-between border border-gray-200 rounded-lg p-3 mb-2">
                <div className="font-mono text-xs break-all mr-2">{uri}</div>
                <Button variant={'ghost'} size={'sm'} disabled={busy}
                    onClick={() => run(
                        () => removeMyFedAlias({params: {uri, authToken: getAuth()!}, clientMode: CLIENT_MODE}),
                        lang['Alias removed']
                    )}>
                    <i className="uil-trash-alt text-lg"/>
                </Button>
            </div>
        )}

        <Input value={input}
            placeholder="https://mastodon.example/users/me"
            onChange={e => setInput(e.target.value)}
            className="mb-2"/>
        <Button variant={'secondary'} disabled={busy || !input.trim()}
            onClick={() => run(
                async () => {
                    await addMyFedAlias({params: {uri: input.trim(), authToken: getAuth()!}, clientMode: CLIENT_MODE})
                    setInput('')
                },
                lang['Alias added']
            )}>
            {lang['Add former identity']}
        </Button>
    </div>
}
