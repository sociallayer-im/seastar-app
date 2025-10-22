import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {getProfileActivities} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export default async function NotificationData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/')
    }

    const activities = await getProfileActivities({
        params: {profile_id: currProfile.id},
        clientMode: CLIENT_MODE
    })

    return {
        currProfile,
        activities
    }
}