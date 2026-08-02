import FediversePageData from '@/app/(normal)/fediverse/data'
import {selectLang} from '@/app/actions'
import Fediverse from '@/app/(normal)/fediverse/Fediverse'

export async function generateMetadata() {
    const {lang} = await selectLang()
    return {title: lang['Fediverse']}
}

export default async function FediversePage() {
    const {events, currProfile, following, authToken} = await FediversePageData()
    const {lang} = await selectLang()
    return <Fediverse lang={lang} events={events} following={following}
                      signedIn={!!currProfile} authToken={authToken}/>
}
