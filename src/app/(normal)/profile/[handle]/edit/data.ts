import {redirect} from "next/navigation"
import {getProfileDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export interface ProfilePageParams {
    handle: string
}

export interface EditProfileDataProps {
    params: ProfilePageParams
}

export default async function EditProfileData({params} : EditProfileDataProps) {
    const handle = params.handle
    const profile =  await getProfileDetailByHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })

    if (!profile) {
        redirect('/error')
    }

    return profile
}
