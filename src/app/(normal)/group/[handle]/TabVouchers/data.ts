import {getGroupVoucherByGroupName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'


export default async function GroupVouchersData(handle: string) {
    return await getGroupVoucherByGroupName({
        params: {groupName: handle},
        clientMode: CLIENT_MODE
    })
}
