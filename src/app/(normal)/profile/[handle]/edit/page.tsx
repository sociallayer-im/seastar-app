import EditProfileData, {EditProfileDataProps} from "@/app/(normal)/profile/[handle]/edit/data"
import EditProfile from "./EditProfile"
import {selectLang} from "@/app/actions"

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: EditProfileDataProps) {
    const profile = await EditProfileData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    return {
        title: `${profile.nickname || profile.name} | Edit Profile | Social Layer`
    }
}

export default async function ProfileEdit(props: EditProfileDataProps) {
    const profile = await EditProfileData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)
    const {lang} = await selectLang()

    return <EditProfile profile={profile} lang={lang}/>
}
