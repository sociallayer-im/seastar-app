import {redirect} from "next/navigation"
import {getProfileDetailById, getVoucherDetailById, Profile} from '@sola/sdk'
import {pickSearchParam} from '@/utils'
import {getCurrProfile} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface VoucherPageParams {
    voucherid: string
}

export interface VoucherPageSearchParams {
    code: string | string[]
}

export interface VoucherPageDataProps {
    params: VoucherPageParams,
    searchParams: VoucherPageSearchParams
}

export default async function VoucherPageData({params, searchParams}: VoucherPageDataProps) {
    const {voucherid} = params
    const voucher = await getVoucherDetailById({
        params: {id: parseInt(voucherid)},
        clientMode: CLIENT_MODE
    })
    const voucherCode = pickSearchParam(searchParams.code)
    let receiver: Profile | null = null

    if (!voucher) {
        redirect('/404')
    }

    if (voucher.receiver_id) {
        receiver = await getProfileDetailById({
            params: {id: voucher.receiver_id},
            clientMode: CLIENT_MODE
        })
    }

    const currProfile = await getCurrProfile()

    return {
        receiver,
        voucherCode,
        voucher,
        currProfile
    }
}


