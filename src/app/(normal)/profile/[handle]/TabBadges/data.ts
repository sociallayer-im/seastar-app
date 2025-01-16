import {getBadgeAndBadgeClassByOwnerHandle, setSdkConfig, ClientMode} from '@sola/sdk'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})


export const ProfileBadgeListData = async (handle: string) => {
    const badgeData = await getBadgeAndBadgeClassByOwnerHandle(handle)

    // move to top if display equals to 'top'
    const owned = badgeData.badges.sort((a, b) => a.display === 'top' ? -1 : b.display === 'top' ? 1 : 0)
    const created = badgeData.badge_classes.sort((a, b) => a.display === 'top' ? -1 : b.display === 'top' ? 1 : 0)

    return {
        created,
        owned
    }
}
