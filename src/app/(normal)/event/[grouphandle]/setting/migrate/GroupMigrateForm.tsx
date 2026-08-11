'use client'

import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {
    addGroupFedAlias,
    FedAliases,
    getGroupFedAliases,
    moveGroupFedActor,
    removeGroupFedAlias
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'

/**
 * Migration is two-sided and the order matters, so the page is built as two
 * labelled halves rather than one "move" button:
 *
 *   — Incoming: this group is the DESTINATION. Declaring the old identity here
 *     is what lets the origin's Move be honoured — peers verify the claim on a
 *     fresh fetch, so without it the move is rejected as a hijack.
 *   — Outgoing: this group is the ORIGIN. Announcing fails with 422 until the
 *     destination has done its half.
 *
 * Outgoing is irreversible in practice (peers re-point their follows), so it
 * asks for an explicit confirmation rather than firing on first click.
 */
export default function GroupMigrateForm({groupId, lang}: {
    groupId: string
    lang: Dictionary
}) {
    const [aliases, setAliases] = useState<FedAliases | null>(null)
    const [aliasInput, setAliasInput] = useState('')
    const [target, setTarget] = useState('')
    const [confirming, setConfirming] = useState(false)
    const [busy, setBusy] = useState(false)
    const {toast} = useToast()

    const load = async () => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            setAliases(await getGroupFedAliases({params: {groupId, authToken}, clientMode: CLIENT_MODE}))
        } catch (e: unknown) {
            toast({description: e instanceof Error ? e.message : 'Failed to load', variant: 'destructive'})
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

    const moved = !!aliases?.moved_to

    return <div>
        <div className="border border-gray-200 rounded-lg p-3 mb-6">
            <div className="text-xs text-gray-500 mb-1">{lang['This group\'s ActivityPub id']}</div>
            <div className="font-mono text-xs break-all">{aliases?.actor_uri || '…'}</div>
            <div className="text-xs text-gray-400 mt-2">{lang['Give this id to the destination']}</div>
        </div>

        {moved && <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 mb-6">
            <div className="text-sm font-semibold text-amber-800">{lang['This group has moved']}</div>
            <div className="font-mono text-xs break-all mt-1">{aliases!.moved_to}</div>
        </div>}

        {/* --- incoming ---------------------------------------------------- */}
        <div className="font-semibold pb-2">{lang['Moving a group here']}</div>
        <div className="text-xs text-gray-500 mb-3">{lang['Alias intro']}</div>

        {aliases?.also_known_as.map(uri =>
            <div key={uri} className="flex-row-item-center justify-between border border-gray-200 rounded-lg p-3 mb-2">
                <div className="font-mono text-xs break-all mr-2">{uri}</div>
                <Button variant={'ghost'} size={'sm'} disabled={busy}
                    onClick={() => run(
                        () => removeGroupFedAlias({
                            params: {groupId, uri, authToken: getAuth()!},
                            clientMode: CLIENT_MODE
                        }),
                        lang['Alias removed']
                    )}>
                    <i className="uil-trash-alt text-lg"/>
                </Button>
            </div>
        )}

        <Input value={aliasInput}
            placeholder="https://old.example/groups/123"
            onChange={e => setAliasInput(e.target.value)}
            className="mb-2"/>
        <Button variant={'secondary'} disabled={busy || !aliasInput.trim()}
            onClick={() => run(
                async () => {
                    await addGroupFedAlias({
                        params: {groupId, uri: aliasInput.trim(), authToken: getAuth()!},
                        clientMode: CLIENT_MODE
                    })
                    setAliasInput('')
                },
                lang['Alias added']
            )}>
            {lang['Add former identity']}
        </Button>

        {/* --- outgoing ---------------------------------------------------- */}
        <div className="font-semibold pb-2 mt-8">{lang['Moving this group away']}</div>
        <div className="text-xs text-gray-500 mb-3">{lang['Move intro']}</div>

        <Input value={target}
            placeholder="https://new.example/groups/456"
            onChange={e => {
                setTarget(e.target.value)
                setConfirming(false)
            }}
            className="mb-2"/>

        {confirming
            ? <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                <div className="text-sm text-red-800 mb-3">{lang['Move confirm']}</div>
                <div className="flex-row-item-center">
                    <Button variant={'destructive'} disabled={busy} className="mr-2"
                        onClick={() => run(
                            async () => {
                                await moveGroupFedActor({
                                    params: {groupId, target: target.trim(), authToken: getAuth()!},
                                    clientMode: CLIENT_MODE
                                })
                                setConfirming(false)
                            },
                            lang['Move announced']
                        )}>
                        {lang['Yes, announce the move']}
                    </Button>
                    <Button variant={'ghost'} disabled={busy} onClick={() => setConfirming(false)}>
                        {lang['Cancel']}
                    </Button>
                </div>
            </div>
            : <Button variant={'secondary'} disabled={busy || !target.trim()}
                onClick={() => setConfirming(true)}>
                {lang['Announce move']}
            </Button>}
    </div>
}
