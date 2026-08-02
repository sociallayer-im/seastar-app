import {getFedEvent} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {notFound} from 'next/navigation'

export interface FedEventDetailPageProps {
    params: {fedeventid: string}
}

export default async function FedEventDetailData(props: FedEventDetailPageProps) {
    const authToken = await getServerSideAuth()
    const event = await getFedEvent({
        params: {eventId: props.params.fedeventid, authToken},
        clientMode: CLIENT_MODE
    }).catch(() => null)

    if (!event) notFound()

    const currProfile = await getCurrProfile()
    return {event, currProfile, authToken}
}
