'use client'

import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {useEffect, useState} from 'react'
import {formatOrderAmount, getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {
    Withdrawal,
    WithdrawalGroup,
    createWithdrawal,
    getGroupWithdrawals,
    getWithdrawalBalance,
    getWithdrawalGroups
} from '@sola/sdk'

const STATUS_LABEL: Record<Withdrawal['status'], string> = {
    pending: 'Awaiting settlement',
    completed: 'Settled',
    rejected: 'Rejected'
}

const STATUS_TONE: Record<Withdrawal['status'], string> = {
    pending: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-600'
}

/**
 * WeChat Pay runs single-merchant mode: every group's WeChat revenue sits in
 * the platform's own merchant account, not the organizer's, so it is settled
 * out by hand rather than transferred automatically. A withdrawal always
 * requests the group's entire available balance and is settled offline —
 * there is no live payout status beyond pending/completed/rejected.
 *
 * Balance is pooled per GROUP: a group can have more than one manager, and
 * the balance any of them sees is the same shared pool, not a personal cut
 * — so this starts with a group picker rather than a single balance.
 */
export default function WithdrawalsManager({lang}: { lang: Dictionary }) {
    const {toast} = useToast()
    const [groups, setGroups] = useState<WithdrawalGroup[] | null>(null)
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [showForm, setShowForm] = useState(false)
    const [bankName, setBankName] = useState('')
    const [bankAccountNumber, setBankAccountNumber] = useState('')
    const [bankAccountName, setBankAccountName] = useState('')
    const [busy, setBusy] = useState(false)

    const selectedGroup = groups?.find(g => g.id === selectedGroupId) ?? null

    const loadGroups = async () => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            const list = await getWithdrawalGroups({params: {authToken}, clientMode: CLIENT_MODE})
            setGroups(list)
            setSelectedGroupId(prev => prev && list.some(g => g.id === prev) ? prev : (list[0]?.id ?? null))
        } catch (e) {
            // Backend without WECHAT_PAY_ENABLED 404s — render nothing useful.
            console.error(e)
            setGroups([])
        }
    }

    const loadWithdrawals = async (groupId: string) => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            setWithdrawals(await getGroupWithdrawals({params: {groupId, authToken}, clientMode: CLIENT_MODE}))
        } catch (e) {
            console.error(e)
            setWithdrawals([])
        }
    }

    const refreshSelectedGroupBalance = async (groupId: string) => {
        const authToken = getAuth()
        if (!authToken) return
        try {
            const bal = await getWithdrawalBalance({params: {groupId, authToken}, clientMode: CLIENT_MODE})
            setGroups(prev => prev?.map(g => g.id === groupId ? {...g, ...bal} : g) ?? prev)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadGroups()
    }, [])

    useEffect(() => {
        if (selectedGroupId) loadWithdrawals(selectedGroupId)
    }, [selectedGroupId])

    const handleWithdraw = async () => {
        if (!selectedGroup) return
        if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) return
        const authToken = getAuth()
        if (!authToken) return
        // The amount is decided server-side (the group's whole available
        // balance) — this just confirms the human meant to send it, the
        // same pattern as StripeKeysManager's confirm before removing a key.
        const amountLabel = formatOrderAmount(selectedGroup.available_amount, selectedGroup.currency)
        if (!window.confirm(`${lang['Confirm Withdrawal']}: ${selectedGroup.name} ${amountLabel} → ${bankName.trim()} ${bankAccountNumber.trim()} (${bankAccountName.trim()})?`)) return
        setBusy(true)
        try {
            await createWithdrawal({
                params: {
                    groupId: selectedGroup.id,
                    bankName: bankName.trim(),
                    bankAccountNumber: bankAccountNumber.trim(),
                    bankAccountName: bankAccountName.trim(),
                    authToken
                },
                clientMode: CLIENT_MODE
            })
            setBankName('')
            setBankAccountNumber('')
            setBankAccountName('')
            setShowForm(false)
            toast({description: lang['Withdrawal requested'], variant: 'success'})
            await Promise.all([loadWithdrawals(selectedGroup.id), refreshSelectedGroupBalance(selectedGroup.id)])
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Failed to request withdrawal',
                variant: 'destructive'
            })
        } finally {
            setBusy(false)
        }
    }

    if (groups === null) return null

    return <div className="max-w-lg mx-auto px-4 py-6">
        <div className="font-semibold text-lg mb-1">{lang['WeChat Pay Withdrawals']}</div>
        <div className="text-xs text-gray-500 mb-4">{lang['WeChat Pay withdrawal intro']}</div>

        {!groups.length &&
            <div className="text-sm text-gray-400 py-8 text-center">{lang['No groups to manage withdrawals for']}</div>
        }

        {groups.length > 1 &&
            <select
                className="w-full mb-4 border border-gray-200 rounded-lg p-2 text-sm"
                value={selectedGroupId ?? ''}
                onChange={e => setSelectedGroupId(e.target.value)}>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
        }

        {!!selectedGroup &&
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs text-gray-500">{lang['Available to withdraw']}</div>
                        <div className="text-2xl font-semibold mt-1">
                            {formatOrderAmount(selectedGroup.available_amount, selectedGroup.currency)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">{lang['Cumulative withdrawn']}</div>
                        <div className="text-sm font-semibold mt-1 text-gray-600">
                            {formatOrderAmount(selectedGroup.total_withdrawn, selectedGroup.currency)}
                        </div>
                    </div>
                </div>
                {/* This balance is shared: any manager of this group sees and can
                    draw against the same pool, not a personal cut of it. */}
                <div className="text-xs text-gray-400 mt-2">{lang['This balance is shared with the group\'s other managers.']}</div>

                {showForm
                    ? <div className="mt-4">
                        <div className="text-sm mb-1">{lang['Bank Name']}</div>
                        <Input inputSize={'md'} className="w-full mb-2" value={bankName}
                            onChange={e => setBankName(e.target.value)}/>
                        <div className="text-sm mb-1">{lang['Bank Account Number']}</div>
                        <Input inputSize={'md'} className="w-full mb-2" value={bankAccountNumber}
                            onChange={e => setBankAccountNumber(e.target.value)}/>
                        <div className="text-sm mb-1">{lang['Bank Account Holder Name']}</div>
                        <Input inputSize={'md'} className="w-full" value={bankAccountName}
                            onChange={e => setBankAccountName(e.target.value)}/>
                        <div className="flex-row-item-center mt-3">
                            <Button variant={'primary'} size={'sm'} disabled={busy} onClick={handleWithdraw}>
                                {lang['Confirm Withdrawal']}
                            </Button>
                            <Button variant={'secondary'} size={'sm'} className="ml-2" onClick={() => setShowForm(false)}>
                                {lang['Cancel']}
                            </Button>
                        </div>
                    </div>
                    : <Button
                        variant={'primary'}
                        size={'sm'}
                        className="mt-3"
                        disabled={selectedGroup.available_amount <= 0}
                        onClick={() => setShowForm(true)}>
                        {lang['Withdraw All']}
                    </Button>
                }
            </div>
        }

        {!!selectedGroup && <>
            <div className="font-semibold text-sm mb-2">{lang['Withdrawal Records']}</div>
            {!withdrawals.length && <div className="text-sm text-gray-400 py-4 text-center">{lang['No withdrawal records yet']}</div>}
            {withdrawals.map(w =>
                <div key={w.id} className="border-b border-gray-100 py-3 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold">{formatOrderAmount(w.amount, w.currency)}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{w.bank_name} · {w.bank_account_number}</div>
                        <div className="text-xs text-gray-400">{new Date(w.created_at).toLocaleString()}</div>
                        {!!w.note && <div className="text-xs text-gray-500 italic mt-0.5">{w.note}</div>}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-sm whitespace-nowrap ${STATUS_TONE[w.status]}`}>
                        {lang[STATUS_LABEL[w.status] as keyof typeof lang] || w.status}
                    </span>
                </div>
            )}
        </>}
    </div>
}
