import {getVoucherByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export const ProfileVoucherData = async (handle: string) => {
    return  await getVoucherByHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })
}

