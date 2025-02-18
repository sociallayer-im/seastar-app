import BadgeClassPageData, {BadgeClassPageDataProps} from "@/app/(normal)/badge-class/[badgeclassid]/data"
import {getCurrProfile, selectLang} from "@/app/actions"
import IssueBadgeForm from "@/app/(normal)/badge-class/[badgeclassid]/send-badge/SendBadgeForm"
import {redirect} from 'next/navigation'

export default async function IssueBadgePage ({params:{badgeclassid}}: BadgeClassPageDataProps) {
    const {badgeClass, toProfile, isPrivate} = await BadgeClassPageData(badgeclassid)
    const {lang} = await selectLang()
    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect('/')
    }

    return <IssueBadgeForm
        isPrivate={isPrivate}
        toProfile={toProfile}
        lang={lang}
        badgeClass={badgeClass}/>
}