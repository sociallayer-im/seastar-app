import BadgeClassPageData, {BadgeClassPageDataProps} from "@/app/(normal)/badge-class/[badgeclassid]/data"
import SendAgainForm from "@/app/(normal)/badge-class/[badgeclassid]/send-again/SendAgainForm"
import {selectLang} from "@/app/actions"


export default async function SendAgainPage(props: BadgeClassPageDataProps) {
    const {badgeClass} = await BadgeClassPageData(props)
    const {lang} = await selectLang()

    return <SendAgainForm lang={lang} badgeClass={badgeClass} />
}