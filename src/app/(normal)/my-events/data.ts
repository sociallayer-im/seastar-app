import {getCurrProfile} from '@/app/actions'
import {redirect} from 'next/navigation'
import {ProfileEventListData} from '@/app/(normal)/profile/[handle]/TabEvents/data'

export default async function MyEventsPageData() {
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/404')
    }

    const {hosting, attends ,stared, coHosting} = await ProfileEventListData(currProfile.handle, currProfile)

    return {
        currProfile,
        attends,
        stared,
        hosting,
        coHosting
    }
}