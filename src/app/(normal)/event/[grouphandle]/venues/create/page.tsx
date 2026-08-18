import {awaitProps, AsyncProps} from '@/utils'
import CreateVenueData, {CreateVenueDataProps} from '@/app/(normal)/event/[grouphandle]/venues/create/data'
import {selectLang} from '@/app/actions'
import CreateVenueForm from '@/app/(normal)/event/[grouphandle]/venues/create/CreateVenueForm'

export default async function CreateVenuePage(props: AsyncProps<CreateVenueDataProps>) {
    const {lang} = await selectLang()
    const {groupDetail, emptyVenue} = await CreateVenueData(await awaitProps(props))

    return <CreateVenueForm
        lang={lang}
        groupDetail={groupDetail}
        venueDetail={emptyVenue}/>
}