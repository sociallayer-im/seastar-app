import {selectLang} from "@/app/actions"
import PermissonForm from '@/app/(normal)/event/[grouphandle]/permission/PermissonForm'
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'

export default async function GroupEventPermissionPage(props: GroupEventSettingDataProps) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(props)

    return <PermissonForm lang={lang} groupDetail={groupDetail} />
}