import {gql, request} from "graphql-request"
import {redirect} from "next/navigation"

export interface ShareVoucherPageParmas {
    voucherid: string
}

export interface ShareVoucherPageDataProps {
    params: ShareVoucherPageParmas
}

export default async function ShareVoucherPageData({params}: ShareVoucherPageDataProps) {
    const {voucherid} = params
    const {vouchers} = await getVoucherDetail(parseInt(voucherid))

    if (!vouchers.length) {
        redirect('/404')
    }

    return {
        voucher: vouchers[0]
    }

}

export function getVoucherDetail(voucherId: number) {
    const doc = gql`query MyQuery {
        vouchers(where:{id:{_eq: ${voucherId}}}) {
            id
            sender_id
            badge_class_id
            counter
            expires_at
            created_at
            badge_class {
                id
                title
                image_url
                content
                group_id
            }
            sender {
              id
              handle
              nickname
              image_url
            }
        }
    }`

    return  request<{vouchers: Solar.Voucher[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)

}

