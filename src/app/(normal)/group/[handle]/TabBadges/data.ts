import {getBadgeClassAndInviteByGroupName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'


export default async function GroupBadgeData(handle: string) {
    return await getBadgeClassAndInviteByGroupName({params: {groupName: handle}, clientMode: CLIENT_MODE})
}
