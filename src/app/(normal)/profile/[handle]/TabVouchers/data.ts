import {ClientMode, getVoucherByHandle, setSdkConfig} from '@sola/sdk'
setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export const ProfileVoucherData = async (handle: string) => {
    return  await getVoucherByHandle(handle)
}

