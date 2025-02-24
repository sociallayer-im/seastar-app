import {redirect} from 'next/navigation'

export default function SchedulePage({searchParams, params}: {
    searchParams: { date: string, view: string },
    params: { grouphandle: string }
}) {
    const {view, date} = searchParams
    const {grouphandle} = params
    const validViews = ['list', 'week', 'day']
    const targetView = validViews.includes(view) ? view : 'list'
    redirect(`/event/${grouphandle}/schedule/${targetView}?start_date=${date}`)
}