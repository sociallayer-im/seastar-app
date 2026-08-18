import {awaitProps, AsyncProps} from '@/utils'
import CreateMarkerData, {CreateMarkerDataProps} from '@/app/(normal)/marker/[grouphandle]/create/data'
import {selectLang} from '@/app/actions'
import CreateMarkerForm from '@/app/(normal)/marker/[grouphandle]/create/CreateMarkerForm'

export default async function CreateMarkerPage(props: AsyncProps<CreateMarkerDataProps>) {
    const {markerDraft, groupDetail} = await CreateMarkerData(await awaitProps(props))
    const {lang} = await selectLang()


    return <div className="min-h-svh w-full">
        <div className="page-width-md py-8!">
           <CreateMarkerForm
               lang={lang}
               groupDetail={groupDetail}
               draft={markerDraft}
           />
       </div>
    </div>
}