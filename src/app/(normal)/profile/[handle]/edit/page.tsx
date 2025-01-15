import EditProfileData, {EditProfileDataProps} from "@/app/(normal)/profile/[handle]/edit/data"
import EditProfile from "./EditProfile"
import {selectLang} from "@/app/actions"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: EditProfileDataProps) {
    const profile = await EditProfileData(props)
    return {
        title: `${profile.nickname || profile.handle} | Edit Profile | Social Layer`
    }
}

export default async function ProfileEdit(props: EditProfileDataProps) {
    const profile = await EditProfileData(props)
    const {lang} = await selectLang()

    return <EditProfile profile={profile} lang={lang}/>
}
