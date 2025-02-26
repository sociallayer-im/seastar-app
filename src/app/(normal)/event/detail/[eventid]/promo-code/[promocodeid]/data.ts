import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {getCouponById, getCouponCodeById, getCouponUsageRecord} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {CLIENT_MODE} from '@/app/config'

export interface PromoCodeDetailParams {
    promocodeid: string
}

export interface PromoCodeDetailPageProps {
    params: PromoCodeDetailParams
}

export default async function PromoCodeDetailData(props: PromoCodeDetailPageProps) {
    const promocodeid = props.params.promocodeid

    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/')
    }

    const couponDetail = await getCouponById({
        params: {
            couponId: parseInt(promocodeid),
        },
        clientMode: CLIENT_MODE
    })

    if (!couponDetail) {
        redirect('/')
    }

    const {code} = await getCouponCodeById({
        params: {
            couponId: couponDetail.id!,
            authToken: (await getServerSideAuth())!
        },
        clientMode: CLIENT_MODE
    })

    if (!code) {
        redirect('/')
    }

    const records = await getCouponUsageRecord({
        params: {couponId: parseInt(promocodeid)},
        clientMode: CLIENT_MODE
    })


    console.log('records', records)

    return {
        code,
        couponDetail,
        currProfile,
        records
    }
}