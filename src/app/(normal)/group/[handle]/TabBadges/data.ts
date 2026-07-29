import {getBadgeClassAndInviteByGroupName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {AUTH_FIELD} from '@/utils'
import {cookies} from 'next/headers'


export default async function GroupBadgeData(handle: string) {
    const authToken = cookies().get(AUTH_FIELD)?.value
    return await getBadgeClassAndInviteByGroupName({params: {groupName: handle, authToken}, clientMode: CLIENT_MODE})
}
