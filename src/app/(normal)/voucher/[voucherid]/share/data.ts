import {redirect} from "next/navigation"
import {getVoucherCode, getVoucherDetailById} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface ShareVoucherPageParams {
    voucherid: string
}

export interface ShareVoucherPageDataProps {
    params: ShareVoucherPageParams,
}

export default async function ShareVoucherPageData({params}: ShareVoucherPageDataProps) {
    const {voucherid} = params
    const voucher = await getVoucherDetailById({
        params: {id: parseInt(voucherid)},
        clientMode: CLIENT_MODE
    })

    if (!voucher) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()
    if (currProfile?.id !== voucher.sender_id) {
        redirect('/404')
    }

    const authToken = await getServerSideAuth()
    const voucherCode = await getVoucherCode({
        params: {voucherId: voucher.id, authToken: authToken!},
        clientMode: CLIENT_MODE
    })

    return {
        voucherCode,
        voucher,
        currProfile
    }
}


