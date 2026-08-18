import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"
import TimezoneForm from "@/app/(normal)/event/[grouphandle]/timezone/TimezoneForm"
import EditTimezoneForm from '@/app/(normal)/event/[grouphandle]/timezone/EditTimezoneForm'
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'

export default async function GroupTracksPage(props: GroupEventSettingDataProps) {
    const {lang} = await selectLang()
    const {groupDetail} = await GroupEventSettingData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)

    return <EditTimezoneForm groupDetail={groupDetail} lang={lang}/>
}