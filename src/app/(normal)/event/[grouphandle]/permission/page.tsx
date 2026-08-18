import {awaitProps, AsyncProps} from '@/utils'
import {selectLang} from "@/app/actions"
import PermissonForm from '@/app/(normal)/event/[grouphandle]/permission/PermissonForm'
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'

export default async function GroupEventPermissionPage(props: AsyncProps<GroupEventSettingDataProps>) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(await awaitProps(props))

    return <PermissonForm lang={lang} groupDetail={groupDetail} />
}