import {selectLang} from "@/app/actions"
import EditVenueForm from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/EditVenueForm'
import EditVenueData, {EditVenuePageProps} from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/data'

export const dynamic = 'force-dynamic'

export default async function EditVenuePage(props: EditVenuePageProps) {
    const {lang} = await selectLang()
    const {groupDetail, venueDetail} = await EditVenueData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)

    return <EditVenueForm 
    lang={lang} 
    venueDetail={venueDetail} 
    groupDetail={groupDetail}/>
}