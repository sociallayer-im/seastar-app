import PromoCodeForm from "@/app/(normal)/event/detail/[eventid]/promo-code/generate/PromoCodeForm"
import {selectLang} from "@/app/actions"

export default async function PromoCodePage() {
    const {lang} = await selectLang()
    return <PromoCodeForm lang={lang}/>
}