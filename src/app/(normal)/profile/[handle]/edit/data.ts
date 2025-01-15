import {getProfileByHandle} from "@/service/solar"
import {redirect} from "next/navigation"
import {getProfileDetailByHandle} from '@sola/sdk'

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
