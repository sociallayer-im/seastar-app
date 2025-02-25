import {redirect} from 'next/navigation'

export default function IframeSchedule({searchParams}:{searchParams: { date?: string, group: string, view?: string }}) {
    const {date, group, view} = searchParams

    if (!group) {
        redirect('/404')
    }

    const validViews = ['list', 'week', 'day']
    const targetView = validViews.includes(view || '') ? view : 'list'
    const targetDate = date || ''

    redirect(`/schedule/${targetView}/${group}${targetDate ? `?start_date=${targetDate}` : ''}`)
}