import {getPopupCityById} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'

export interface EditPopupCityPageProps {
    params: {
        popupcityid: string
    }
}

export default async function EditPopupCityPageData(popupCityId: string) {
    const popupCity = await getPopupCityById({
        params: {id: Number(popupCityId)},
        clientMode: CLIENT_MODE
    })

    if (!popupCity) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect(`/event/${popupCity.group.handle}`)
    }

    return {
        currProfile,
        popupCity
    }
}