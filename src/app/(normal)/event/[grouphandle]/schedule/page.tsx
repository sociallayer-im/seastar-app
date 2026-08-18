import {redirect} from 'next/navigation'

export default async function SchedulePage(
    props: {
        searchParams: Promise<{ date: string, view: string }>,
        params: Promise<{ grouphandle: string }>
    }
) {
    const params = await props.params
    const searchParams = await props.searchParams
    const {view, date} = searchParams
    const {grouphandle} = params
    const validViews = ['list', 'week', 'day']
    const targetView = validViews.includes(view) ? view : 'list'
    redirect(`/event/${grouphandle}/schedule/${targetView}?start_date=${date}`)
}