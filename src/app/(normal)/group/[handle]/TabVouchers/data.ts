import {getGroupVoucherByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'


export default async function GroupVouchersData(handle: string) {
    return await getGroupVoucherByHandle({
        params: {groupHandle: handle},
        clientMode: CLIENT_MODE
    })
}
