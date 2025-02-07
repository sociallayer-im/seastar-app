import {getBadgeAndBadgeClassByOwnerHandle, ClientMode} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'


export const ProfileBadgeListData = async (handle: string) => {
    const badgeData = await getBadgeAndBadgeClassByOwnerHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })

    // move to top if display equals to 'top'
    const owned = badgeData.badges.sort((a, b) => a.display === 'top' ? -1 : b.display === 'top' ? 1 : 0)
    const created = badgeData.badgeClasses.sort((a, b) => a.display === 'top' ? -1 : b.display === 'top' ? 1 : 0)

    return {
        created,
        owned
    }
}
