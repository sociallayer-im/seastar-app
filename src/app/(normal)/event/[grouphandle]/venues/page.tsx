import {selectLang} from "@/app/actions"
import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import VenueListForm from '@/app/(normal)/event/[grouphandle]/venues/VenueListForm'

export default async function GroupVenuesPage(props: GroupEventSettingDataProps) {
    const {lang} = await selectLang()
    const {groupDetail, isManager} = await GroupEventSettingData(props)

    return <VenueListForm lang={lang} groupDetail={groupDetail} isManager={isManager}/>
}