'use client'

import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {
    claimGroupFedDomain,
    FedDomainStatus,
    getGroupFedDomain,
    unbindGroupFedDomain,
    verifyGroupFedDomain
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'

/**
 * Binding a domain is three steps, and the UI has to keep them visibly
 * separate or people stop after the first: claim (mints a DNS challenge),
 * publish the TXT record at their registrar, verify.
 *
 * The record is shown with a copy button rather than only described, because
 * a mistyped challenge fails verification with nothing to point at.
 */
export default function GroupDomainForm({groupId, groupName, lang}: {
    groupId: string
    groupName: string
    lang: Dictionary
}) {
    const [status, setStatus] = useState<FedDomainStatus | null>(null)
    const [domain, setDomain] = useState('')
    const [busy, setBusy] = useState(false)
    const {toast} = useToast()

    const load = async () => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            const s = await getGroupFedDomain({params: {groupId, authToken}, clientMode: CLIENT_MODE})
            setStatus(s)
            setDomain(s.pending_domain || s.domain || '')
        } catch (e: unknown) {
            toast({description: e instanceof Error ? e.message : 'Failed to load', variant: 'destructive'})
        }
    }

    useEffect(() => {
        load()
    }, [])

    const run = async (fn: () => Promise<FedDomainStatus>, successMsg: string) => {
        setBusy(true)
        try {
            setStatus(await fn())
            toast({description: successMsg})
        } catch (e: unknown) {
            toast({description: e instanceof Error ? e.message : 'Failed', variant: 'destructive'})
        } finally {
            setBusy(false)
        }
    }

    const copy = (value: string) => {
        navigator.clipboard?.writeText(value)
        toast({description: lang['Copied']})
    }

    const record = (label: string, r: {type: string, name: string, value: string}) =>
        <div className="border border-gray-200 rounded-lg p-3 mb-2">
            <div className="text-xs text-gray-500 mb-2">{label}</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm break-all">
                <span className="text-gray-400">{lang['Type']}</span><span>{r.type}</span>
                <span className="text-gray-400">{lang['Name']}</span><span className="font-mono">{r.name}</span>
                <span className="text-gray-400">{lang['Value']}</span>
                <span className="font-mono flex-row-item-center justify-between">
                    <span>{r.value}</span>
                    <Button variant={'ghost'} size={'sm'} onClick={() => copy(r.value)}>
                        <i className="uil-copy text-lg"/>
                    </Button>
                </span>
            </div>
        </div>

    return <div>
        <div className="text-xs text-gray-500 mb-4">{lang['Custom domain intro']}</div>

        <div className="border border-gray-200 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-500 mb-1">{lang['Current handle']}</div>
            <div className="font-mono text-sm break-all">@{status?.acct || `${groupName}@…`}</div>
            {status?.state === 'bound' &&
                <div className="text-xs text-gray-400 mt-2 break-all">
                    {lang['Canonical handle keeps working']}: @{status.canonical_acct}
                </div>}
        </div>

        {status?.state === 'bound'
            ? <>
                <div className="text-sm mb-3">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 mr-2">
                        {lang['Bound']}
                    </span>
                    <span className="font-mono">{status.domain}</span>
                </div>
                <Button variant={'secondary'} disabled={busy}
                    onClick={() => run(
                        () => unbindGroupFedDomain({params: {groupId, authToken: getAuth()!}, clientMode: CLIENT_MODE}),
                        lang['Domain unbound']
                    )}>
                    {lang['Unbind domain']}
                </Button>
                <div className="text-xs text-gray-400 mt-2">{lang['Unbind is lossless']}</div>
            </>
            : <>
                <div className="font-semibold pb-2">{lang['Step 1: claim the domain']}</div>
                <Input value={domain}
                    placeholder="hi.example.org"
                    onChange={e => setDomain(e.target.value)}
                    className="mb-2"/>
                <Button variant={'primary'} disabled={busy || !domain.trim()}
                    onClick={() => run(
                        () => claimGroupFedDomain({
                            params: {groupId, domain: domain.trim(), authToken: getAuth()!},
                            clientMode: CLIENT_MODE
                        }),
                        lang['Challenge created']
                    )}>
                    {lang['Get DNS record']}
                </Button>

                {status?.state === 'pending' && !!status.dns_challenge && <div className="mt-6">
                    <div className="font-semibold pb-2">{lang['Step 2: add these DNS records']}</div>
                    {record(lang['Proves you own the domain'], status.dns_challenge)}
                    {!!status.dns_routing && record(lang['Points the domain here'], status.dns_routing)}
                    <div className="text-xs text-gray-500 mb-4">{status.note}</div>

                    <div className="font-semibold pb-2">{lang['Step 3: verify']}</div>
                    <Button variant={'primary'} disabled={busy}
                        onClick={() => run(
                            () => verifyGroupFedDomain({
                                params: {groupId, authToken: getAuth()!},
                                clientMode: CLIENT_MODE
                            }),
                            lang['Domain bound']
                        )}>
                        {lang['Verify and bind']}
                    </Button>
                    <div className="text-xs text-gray-400 mt-2">{lang['DNS may take a few minutes']}</div>
                </div>}
            </>}
    </div>
}
