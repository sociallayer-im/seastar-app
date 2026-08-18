import {redirect} from 'next/navigation'

export default async function IframeSchedule(
    props:{searchParams: Promise<{ date?: string, group: string, view?: string }>}
) {
    const searchParams = await props.searchParams
    const {date, group, view} = searchParams

    if (!group) {
        redirect('/404')
    }

    const validViews = ['list', 'week', 'day']
    const targetView = validViews.includes(view || '') ? view : 'list'
    const targetDate = date || ''

    redirect(`/schedule/${targetView}/${group}${targetDate ? `?start_date=${targetDate}` : ''}`)
}