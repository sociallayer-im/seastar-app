import { getGqlClient } from "../client"
import { GET_VOUCHER_DETAIL_BY_ID, GET_VOUCHER_DETAIL_BY_HANDLE } from "./schemas"
import {type Voucher, VoucherDetail,} from "./types"

/**
 * Get voucher by handle
 * @param handle - handle
 */
export const getVoucherByHandle = async (handle: string) => {
    const client = getGqlClient()
    const expiresAt = new Date().toISOString()

    const response = await client.query({
        query: GET_VOUCHER_DETAIL_BY_HANDLE,
        variables: { handle, expires_at: expiresAt }
    })

    return response.data.vouchers as Voucher[]
}

/**
 * Get voucher by id
 * @param id - id
 */
export const getVoucherDetailById = async (id: number) => {
    const client = getGqlClient()
    const response = await client.query({
        query: GET_VOUCHER_DETAIL_BY_ID,
        variables: {id}
    })

    return response.data.vouchers[0] as VoucherDetail || null
}

