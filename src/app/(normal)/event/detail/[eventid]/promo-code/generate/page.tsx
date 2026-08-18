import PromoCodeForm from "@/app/(normal)/event/detail/[eventid]/promo-code/generate/PromoCodeForm"
import {selectLang} from "@/app/actions"

export default async function PromoCodePage(props:{params: Promise<{eventid: string}>}) {
    const params = await props.params
    const {lang} = await selectLang()
    return <PromoCodeForm lang={lang} eventId={Number(params.eventid)}/>
}