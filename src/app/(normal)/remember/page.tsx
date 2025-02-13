import {getCurrProfile, selectLang} from '@/app/actions'
import Remember from './Remember'

export default async function RememberPage() {
    const {lang} = await selectLang()
    const currProfile = await getCurrProfile()

    return <Remember lang={lang} currProfile={currProfile} />
}
