import {ClientMode, getProfileGroup, setSdkConfig} from '@sola/sdk'
setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export const UserGroupListData = async (handle: string) => {
   return await getProfileGroup(handle)
}
