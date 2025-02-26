import {ClientMode, getProfileGroup} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export const UserGroupListData = async (handle: string) => {
   return await getProfileGroup({
      params: {profileHandle: handle},
      clientMode: CLIENT_MODE
   })
}
