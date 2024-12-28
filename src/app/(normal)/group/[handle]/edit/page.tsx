import GroupEditPageData, {GroupEditDataProps} from "@/app/(normal)/group/[handle]/edit/data"
import EditGroup from './EditGroup'
import {selectLang} from "@/app/actions"
import {EditProfileDataProps} from "@/app/(normal)/profile/[handle]/edit/data"

export async function generateMetadata(props: EditProfileDataProps) {
    const {group} = await GroupEditPageData(props)
    console.log('1' + group.nickname || group.handle)
    return {
        title: `${group.nickname || group.handle} | Edit Profile | Social Layer`
    }
}

export default async function EditGroupPage(props: GroupEditDataProps) {
    const {group, isGroupManager} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    console.log('2' + group.nickname || group.handle)
    return <EditGroup
        lang={lang}
        isManager={isGroupManager}
        group={group}/>

}
