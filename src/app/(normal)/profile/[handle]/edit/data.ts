import {redirect} from "next/navigation"
import {getProfileDetailByHandle, setSdkConfig, ClientMode} from '@sola/sdk'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export interface ProfilePageParams {
    handle: string
}

export interface EditProfileDataProps {
    params: ProfilePageParams
}

export default async function EditProfileData({params} : EditProfileDataProps) {
    const handle = params.handle
    const profile =  await getProfileDetailByHandle(handle)

    if (!profile) {
        redirect('/error')
    }

    return profile
}
