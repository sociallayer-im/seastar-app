import {getBadgeClassAndInviteByGroupHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'


export default async function GroupBadgeData(handle: string) {
    return await getBadgeClassAndInviteByGroupHandle({params: {groupHandle: handle}, clientMode: CLIENT_MODE})
}
