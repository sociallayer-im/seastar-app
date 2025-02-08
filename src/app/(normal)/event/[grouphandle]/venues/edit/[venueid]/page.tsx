import {selectLang} from "@/app/actions"
import EditVenueForm from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/EditVenueForm'
import EditVenueData, {EditVenueDataProps} from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/data'

export const dynamic = 'force-dynamic'

export default async function EditVenuePage(props: EditVenueDataProps) {
    const {lang} = await selectLang()
    const {groupDetail, venueDetail} = await EditVenueData(props)

    return <EditVenueForm lang={lang} venueDetail={venueDetail} groupDetail={groupDetail}/>
}