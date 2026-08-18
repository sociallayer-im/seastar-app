import {selectLang} from "@/app/actions"
import PermissonForm from '@/app/(normal)/event/[grouphandle]/permission/PermissonForm'
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'

export default async function GroupEventPermissionPage(props: GroupEventSettingDataProps) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)

    return <PermissonForm lang={lang} groupDetail={groupDetail} />
}