import {selectLang} from '@/app/actions'
import AdminWithdrawalsData from '@/app/(normal)/admin/withdrawals/data'
import AdminWithdrawalsList from '@/app/(normal)/admin/withdrawals/AdminWithdrawalsList'
import {pickSearchParam} from '@/utils'

/**
 * Every WeChat withdrawal request, for platform admins to settle by hand.
 *
 * There is no transfer API behind Withdrawal (WeChat Pay's single-merchant
 * mode pools every group's revenue into the platform's own account) — this
 * page IS the settlement step: an admin pays the listed bank details
 * outside sola, then marks the request completed or rejected here.
 */
export default async function AdminWithdrawalsPage(props: {searchParams?: Promise<{ status?: string | string[], page?: string | string[] }>}) {
    const searchParams = await props.searchParams
    const {lang} = await selectLang()
    const status = pickSearchParam(searchParams?.status)
    const page = Number(pickSearchParam(searchParams?.page)) || 1
    const {withdrawals, total, totalPages} = await AdminWithdrawalsData(status, page)

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <AdminWithdrawalsList lang={lang} withdrawals={withdrawals} total={total}
            status={status || ''} page={page} totalPages={totalPages}/>
    </div>
}
