import {redirect} from 'next/navigation'

export default async function Page(props:{params: Promise<{eventid: string}>}) {
    const params = await props.params

    const {
        eventid
    } = params

    redirect(`/event/share/${eventid}`)
}