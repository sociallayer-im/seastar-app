import {redirect} from 'next/navigation'
import {getAllWithdrawals, WithdrawalAdmin} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {isPlatformAdmin} from '@/utils'

export const ADMIN_WITHDRAWALS_PAGE_SIZE = 20

export interface AdminWithdrawalsDataProps {
    withdrawals: WithdrawalAdmin[]
    total: number
    page: number
    totalPages: number
}

export default async function AdminWithdrawalsData(status?: string, page?: number): Promise<AdminWithdrawalsDataProps> {
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    // A courtesy gate only — the API answers 403 to a non-admin regardless, so
    // this saves a wasted round trip rather than providing the authorization.
    if (!authToken || !isPlatformAdmin(currProfile)) redirect('/404')

    const res = await getAllWithdrawals({
        params: {authToken, status, page: page && page > 0 ? page : 1, limit: ADMIN_WITHDRAWALS_PAGE_SIZE},
        clientMode: CLIENT_MODE
    })
    return {withdrawals: res.data, total: res.meta.total, page: res.meta.page, totalPages: res.meta.total_pages}
}
