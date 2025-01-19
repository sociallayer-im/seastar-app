import {getGroupVoucherByHandle, setSdkConfig, ClientMode} from '@sola/sdk'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export default async function GroupVouchersData(handle: string) {
    return await getGroupVoucherByHandle(handle)
}
