import {selectLang} from '@/app/actions'
import FormsHubData from '@/app/(normal)/forms/data'
import FormsHub from '@/app/(normal)/forms/FormsHub'

/**
 * The forms hub: everything I created, and everything I filled in.
 *
 * A Form has never depended on an Event — `events.form_id` points AT a form —
 * so this page is where forms live on their own, and where a form that happens
 * to be an event's registration questions is listed too (linking back to the
 * event, which is where it is edited).
 */
export default async function FormsPage(props: {searchParams: {tab?: string}}) {
    const {lang} = await selectLang()
    const {created, filled} = await FormsHubData()
    // Anything that is not the one other tab is the default — a hand-edited
    // ?tab=nonsense should show the page, not nothing.
    const initialTab = props.searchParams.tab === 'filled' ? 'filled' : 'created'

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <FormsHub lang={lang} created={created} filled={filled} initialTab={initialTab}/>
    </div>
}
