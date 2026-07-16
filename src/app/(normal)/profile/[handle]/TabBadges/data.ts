import {getBadgeAndBadgeClassByOwnerName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'


export const ProfileBadgeListData = async (handle: string) => {
    const badgeData = await getBadgeAndBadgeClassByOwnerName({
        params: {name: handle},
        clientMode: CLIENT_MODE
    })

    // move to top if display equals to 'top'
    const owned = badgeData.badges.sort((a, b) => a.display === 'pinned' ? -1 : b.display === 'pinned' ? 1 : 0)
    const created = badgeData.badgeClasses.sort((a, b) => a.display === 'pinned' ? -1 : b.display === 'pinned' ? 1 : 0)

    return {
        created,
        owned
    }
}
