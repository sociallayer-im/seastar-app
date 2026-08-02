import FedEventDetailData, {FedEventDetailPageProps} from '@/app/(normal)/fediverse/[fedeventid]/data'
import {selectLang} from '@/app/actions'
import FedEventDetail from '@/app/(normal)/fediverse/[fedeventid]/FedEventDetail'

export async function generateMetadata(props: FedEventDetailPageProps) {
    const {event} = await FedEventDetailData(props)
    return {title: event.title || 'Event'}
}

export default async function FedEventDetailPage(props: FedEventDetailPageProps) {
    const {event, currProfile, authToken} = await FedEventDetailData(props)
    const {lang} = await selectLang()
    return <FedEventDetail lang={lang} event={event} signedIn={!!currProfile} authToken={authToken}/>
}
