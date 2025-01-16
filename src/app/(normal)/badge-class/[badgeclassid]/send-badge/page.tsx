import BadgeClassPageData, {BadgeClassPageDataProps} from "@/app/(normal)/badge-class/[badgeclassid]/data"
import {selectLang} from "@/app/actions"
import {pickSearchParam} from "@/utils"
import IssueBadgeForm from "@/app/(normal)/badge-class/[badgeclassid]/send-badge/SendBadgeForm"

export interface IssueBadgePageDataParams extends BadgeClassPageDataProps{
    searchParams: {reason:  string | string[]}
}

export default async function IssueBadgePage (props: IssueBadgePageDataParams) {
    const {badgeClass} = await BadgeClassPageData(props)
    const {lang} = await selectLang()
    const reason = pickSearchParam(props.searchParams.reason)

    return <IssueBadgeForm
        lang={lang}
        badgeClass={badgeClass}
         />
}