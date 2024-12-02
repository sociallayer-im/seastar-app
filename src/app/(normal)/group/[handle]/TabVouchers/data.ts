import {gql, request} from 'graphql-request'
export type SampleVoucher = Pick<Solar.Voucher, 'id' | 'badge_class' >

export default async function GroupVouchersData(handle: string) {
    const doc = gql`query MyQuery {
      vouchers(where: {expires_at: {_gt: "${new Date().toISOString()}"}, counter: {_neq: 0}, badge_class: {group: {handle: {_eq: "${handle}"}}}}, order_by: {id: desc}) {
            id
            expires_at
            badge_class {
                id,
                title,
                image_url,
            }
      }}`
    return await request<{vouchers: SampleVoucher[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}
