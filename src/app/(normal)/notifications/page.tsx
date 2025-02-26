import {selectLang} from "@/app/actions"
import Notifications from './Notifications'
import NotificationData from '@/app/(normal)/notifications/data'

export default async function NotificationsPage() {
    const {lang} = await selectLang()
    const {activities, currProfile} = await NotificationData()
    
    return <Notifications lang={lang} activities={activities} />
}