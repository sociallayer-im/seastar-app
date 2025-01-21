import {redirect} from "next/navigation"
import {getVoucherCode, getVoucherDetailById} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'

export interface ShareVoucherPageParams {
    voucherid: string
}

export interface ShareVoucherPageDataProps {
    params: ShareVoucherPageParams,
}

export default async function ShareVoucherPageData({params}: ShareVoucherPageDataProps) {
    const {voucherid} = params
    const voucher = await getVoucherDetailById(parseInt(voucherid))

    if (!voucher) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (currProfile?.id !== voucher.sender_id) {
        redirect('/404')
    }

    const authToken = await getServerSideAuth()
    const voucherCode = await getVoucherCode(voucher.id, authToken!)

    return {
        voucherCode,
        voucher,
        currProfile
    }
}


