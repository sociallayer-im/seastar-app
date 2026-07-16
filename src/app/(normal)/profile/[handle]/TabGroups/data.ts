import {getProfileGroup} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export const UserGroupListData = async (handle: string) => {
   return await getProfileGroup({
      params: {profileName: handle},
      clientMode: CLIENT_MODE
   })
}
