import {getVoucherBySenderName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export const ProfileVoucherData = async (handle: string) => {
    return  await getVoucherBySenderName({
        params: {name: handle},
        clientMode: CLIENT_MODE
    })
}

