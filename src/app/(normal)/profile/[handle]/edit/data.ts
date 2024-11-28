import {getProfileByHandle} from "@/service/solar"
import {redirect} from "next/navigation"

export interface ProfilePageParams {
    handle: string
}

export interface EditProfileDataProps {
    params: ProfilePageParams
}


export default async function EditProfileData({params} : EditProfileDataProps) {
    const handle = params.handle
    const profile =  await getProfileByHandle(handle)

    if (!profile) {
        redirect('/error')
    }

    return profile
}
