import {redirect} from 'next/navigation'

export default function CalendarPage({params}:{params:{grouphandle:string}}){
    redirect(`/event/${params.grouphandle}/schedule/list`)
}