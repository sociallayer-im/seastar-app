import {selectLang} from "@/app/actions"
import CreateBadgeForm from "@/app/(normal)/create-badge/CreateBadgeForm"

export default async function CreateBadgePage() {
    const {lang} = await selectLang()
    return <CreateBadgeForm lang={lang} />
}