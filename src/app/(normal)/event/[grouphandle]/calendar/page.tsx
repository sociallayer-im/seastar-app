import {redirect} from 'next/navigation'

export default async function CalendarPage(props:{params: Promise<{grouphandle:string}>}) {
    const params = await props.params
    redirect(`/event/${params.grouphandle}/schedule/list`)
}