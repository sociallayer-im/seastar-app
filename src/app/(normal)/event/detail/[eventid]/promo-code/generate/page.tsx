import PromoCodeForm from "@/app/(normal)/event/detail/[eventid]/promo-code/generate/PromoCodeForm"
import {selectLang} from "@/app/actions"

export default async function PromoCodePage({params}:{params: {eventid: string}}) {
    const {lang} = await selectLang()
    return <PromoCodeForm lang={lang} eventId={Number(params.eventid)}/>
}