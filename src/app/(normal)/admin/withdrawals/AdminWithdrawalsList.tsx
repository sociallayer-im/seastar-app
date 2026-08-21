'use client'

import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {updateWithdrawalStatus, WithdrawalAdmin} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {formatOrderAmount, getAuth} from '@/utils'

const STATUS_TONE: Record<WithdrawalAdmin['status'], string> = {
    pending: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-600'
}

const TABS: { key: string, label: keyof Dictionary }[] = [
    {key: '', label: 'All'},
    {key: 'pending', label: 'Awaiting settlement'},
    {key: 'completed', label: 'Settled'},
    {key: 'rejected', label: 'Rejected'}
]

export default function AdminWithdrawalsList({lang, withdrawals, total, status, page, totalPages}: {
    lang: Dictionary
    withdrawals: WithdrawalAdmin[]
    total: number
    status: string
    page: number
    totalPages: number
}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()

    const pageHref = (p: number) => {
        const params = new URLSearchParams()
        if (status) params.set('status', status)
        if (p > 1) params.set('page', String(p))
        const qs = params.toString()
        return qs ? `/admin/withdrawals?${qs}` : '/admin/withdrawals'
    }

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

    // window.prompt rather than a dialog field: this is an internal,
    // low-volume admin tool, and every other confirmation here already
    // leans on native browser dialogs (see WithdrawalsManager's
    // window.confirm) rather than a bespoke form.
    const settle = (w: WithdrawalAdmin) => showConfirmDialog({
        lang,
        title: `${w.group_name} · ${formatOrderAmount(w.amount, w.currency)}`,
        content: lang['Mark this withdrawal as settled? Only do this after the bank transfer has actually been sent.'],
        onConfig: () => {
            const note = window.prompt(lang['Note for the group\'s managers (optional)']) || undefined
            return run(authToken =>
                updateWithdrawalStatus({params: {id: w.id, status: 'completed', note, authToken}, clientMode: CLIENT_MODE})
                    .then(() => undefined)
            )
        }
    })

    const reject = (w: WithdrawalAdmin) => showConfirmDialog({
        lang,
        type: 'danger',
        title: `${w.group_name} · ${formatOrderAmount(w.amount, w.currency)}`,
        content: lang['Reject this withdrawal? The amount becomes available to request again.'],
        onConfig: () => {
            const note = window.prompt(lang['Reason for rejecting (shown to the group\'s managers)']) || undefined
            return run(authToken =>
                updateWithdrawalStatus({params: {id: w.id, status: 'rejected', note, authToken}, clientMode: CLIENT_MODE})
                    .then(() => undefined)
            )
        }
    })

    return <div className="max-w-[860px] mx-auto">
        <div className="flex-row-item-center justify-between mb-4">
            <div className="text-xl font-semibold">{lang['WeChat Pay Withdrawals']} ({total})</div>
        </div>

        <div className="flex flex-row flex-wrap gap-2 mb-4">
            {TABS.map(tab =>
                <a key={tab.key} href={tab.key ? `/admin/withdrawals?status=${tab.key}` : '/admin/withdrawals'}
                   className={`text-xs px-2 py-1 rounded-full ${status === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {lang[tab.label]}
                </a>
            )}
        </div>

        <div className="flex flex-col gap-3">
            {!withdrawals.length &&
                <div className="text-sm text-gray-400 py-8 text-center">{lang['No withdrawal records yet']}</div>
            }
            {withdrawals.map(w =>
                <div key={w.id} className="rounded-lg bg-(--background) shadow-sm p-4">
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold">{w.group_name}</div>
                        <span className={`text-xs px-2 py-1 rounded-sm whitespace-nowrap ${STATUS_TONE[w.status]}`}>
                            {w.status}
                        </span>
                    </div>

                    <div className="mt-2 text-lg font-semibold">{formatOrderAmount(w.amount, w.currency)}</div>
                    <div className="mt-1 text-xs text-gray-500">
                        {lang['Bank Name']}: {w.bank_name} · {lang['Bank Account Number']}: {w.bank_account_number}
                        {' · '}{w.bank_account_name}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                        {lang['Requested by']} {w.requested_by} · {new Date(w.created_at).toLocaleString()}
                    </div>
                    {w.status !== 'pending' && !!w.processed_by_name &&
                        <div className="mt-1 text-xs text-gray-400">
                            {lang['Processed by']} {w.processed_by_name}
                            {!!w.processed_at && ` · ${new Date(w.processed_at).toLocaleString()}`}
                        </div>
                    }
                    {!!w.note &&
                        <div className="mt-1 text-xs text-gray-500 italic">{w.note}</div>
                    }

                    {w.status === 'pending' &&
                        <div className="flex flex-row flex-wrap gap-2 mt-3">
                            <Button variant="primary" size="xs" onClick={() => settle(w)}>
                                {lang['Mark Settled']}
                            </Button>
                            <Button variant="destructive" size="xs" onClick={() => reject(w)}>
                                {lang['Reject']}
                            </Button>
                        </div>
                    }
                </div>
            )}
        </div>

        {totalPages > 1 &&
            <div className="flex-row-item-center justify-center gap-4 mt-6 text-sm">
                {page > 1
                    ? <a href={pageHref(page - 1)} className="text-blue-500">{lang['Prev']}</a>
                    : <span className="text-gray-300">{lang['Prev']}</span>
                }
                <span className="text-gray-500">{page} / {totalPages}</span>
                {page < totalPages
                    ? <a href={pageHref(page + 1)} className="text-blue-500">{lang['Next']}</a>
                    : <span className="text-gray-300">{lang['Next']}</span>
                }
            </div>
        }
    </div>
}
