import {redirect} from 'next/navigation'

export default async function Page({params:{eventid}}:{params: {eventid: string}}) {
    redirect(`/event/share/${eventid}`)
}