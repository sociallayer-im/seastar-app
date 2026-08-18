import CreateVenueData, {CreateVenueDataProps} from '@/app/(normal)/event/[grouphandle]/venues/create/data'
import {selectLang} from '@/app/actions'
import CreateVenueForm from '@/app/(normal)/event/[grouphandle]/venues/create/CreateVenueForm'

export default async function CreateVenuePage(props: CreateVenueDataProps) {
    const {lang} = await selectLang()
    const {groupDetail, emptyVenue} = await CreateVenueData(/* @next-codemod-error 'props' is passed as an argument. Any asynchronous properties of 'props' must be awaited when accessed. */
    props)

    return <CreateVenueForm
        lang={lang}
        groupDetail={groupDetail}
        venueDetail={emptyVenue}/>
}