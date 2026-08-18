import {awaitProps, AsyncProps} from '@/utils'
import EditProfileData, {EditProfileDataProps} from "@/app/(normal)/profile/[handle]/edit/data"
import EditProfile from "./EditProfile"
import {selectLang} from "@/app/actions"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: AsyncProps<EditProfileDataProps>) {
    const profile = await EditProfileData(await awaitProps(props))
    return {
        title: `${profile.nickname || profile.name} | Edit Profile | Social Layer`
    }
}

export default async function ProfileEdit(props: AsyncProps<EditProfileDataProps>) {
    const profile = await EditProfileData(await awaitProps(props))
    const {lang} = await selectLang()

    return <EditProfile profile={profile} lang={lang}/>
}
